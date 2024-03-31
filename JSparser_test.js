const lexer = require('./JSlexer');
const { newLexer } = require('./JSlexer');
const parser = require('./JSparser');
const { newParser } = require('./JSparser');
const ast = require('./JSast');

function checkParserErrors(p) {
    const errors = p.Errors();
    if (errors.length === 0) {
        return;
    }

    console.error(`Parser has ${errors.length} errors`);
    for (const msg of errors) {
        console.error(`Parser error: ${msg}`);
    }
    process.exit(1);
}

function testReturnStatements() {
    const tests = [
        // { input: "return 5 ;", expectedValue: 5 },
        // { input: "return true;", expectedValue: true },
        // { input: "return y;", expectedValue: "y" },
    ];

    for (const test of tests) {
        const l = newLexer(test.input);
        const p = newParser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        if (program.Statements.length !== 1) {
            console.error(`Program statements do not contain 1 statement. Got ${program.Statements.length}`);
            continue;
        }

        const stmt = program.Statements[0];
        if (!(stmt instanceof ast.ReturnStatement)) {
            console.error(`Statement is not ReturnStatement. Got ${stmt}`);
            continue;
        }

        // parser のstmtと同じのが入っている
        // console.log("in testReturnStatements() stmt:" + JSON.stringify(stmt, null, 2))

        const returnStmt = stmt;
        console.log("returnStmt.TokenLiteral() is " + returnStmt.TokenLiteral());
        if (returnStmt.TokenLiteral() !== "return") {
            console.error(`ReturnStatement TokenLiteral not 'return'. Got ${returnStmt.TokenLiteral()}`);
            continue;
        }

        const returnValue = returnStmt.ReturnValue;
        console.log("returnValue is " + JSON.stringify(returnValue, null, 2));
        console.log("test.expectedValue is " + test.expectedValue);
        if (!testLiteralExpression(returnValue, test.expectedValue)) {
            continue;
        }
    }
}

function testLoopExpression() {
    const tests = [
        `loop(4) {4+1;\
             return true;\
        }`,
    ];

    for (const test of tests) {
        const l = newLexer(test);
        const p = newParser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        if (program.Statements.length !== 1) {
            console.error(`Program statements do not contain 1 statement. Got ${program.Statements.length}`);
            continue;
        }

        const stmt = program.Statements[0];
        if (!(stmt instanceof ast.ExpressionStatement)) {
            console.error(`Statement is not ExpressionStatement. Got ${stmt}`);
            continue;
        }

        // parser のstmtと同じのが入っている
        // console.log("in testReturnStatements() stmt:" + JSON.stringify(stmt, null, 2))

        const exp = stmt.Expression;
        console.log("exp.TokenLiteral() is " + exp.TokenLiteral());
        if (!(exp instanceof ast.LoopExpression)) {
            console.error(`stmt.Expression is not ast.LoopExpression. Got ${exp.TokenLiteral()}`);
            continue;
        }

        if (!(testIntegerLiteral(exp.Condition, 4))){
            console.error(`exp.Condition is Error.`);
            continue;
        }

        if (exp.Consequence.Statements.length != 2){
            console.error(`Consequence is not 1 statements. Got ${length(exp.Consequence.Statements)}`)
        }

        const consequence = exp.Consequence.Statements[0]
        if (!(consequence instanceof ast.ReturnStatement)) {
            console.error(`consequence is not ast.ReturnStatement. Got ${consequence.TokenLiteral()}`);
            continue;
        }

        if (!testReturnStatements(consequence, "true")){
            continue;
        }
    }
}


function testFloatLiteralExpression() {
    const input = "1.2;";
    const l = newLexer(input);
    const p = newParser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    if (program.Statements.length !== 1) {
        console.error(`program has not enough statements. Got ${program.Statements.length}`);
        return;
    }

    const stmt = program.Statements[0];
    if (!(stmt instanceof ast.ExpressionStatement)) {
        console.error(`program.Statements[0] is not ast.ExpressionStatement. Got ${typeof stmt}`);
        return;
    }

    const literal = stmt.Expression;
    if (!(literal instanceof ast.FloatLiteral)) {
        console.error(`exp not ast.FloatLiteral. Got ${typeof literal}`);
        return;
    }

    if (literal.TokenLiteral() !== "1.2") {
        console.error(`literal.TokenLiteral not '1.2'. Got ${literal.TokenLiteral()}`);
        return;
    }

    console.log("testFloatLiteralExpression passed successfully.");
}







function testLiteralExpression(exp, expected) {
    if (typeof expected === "number") {
        return testIntegerLiteral(exp, expected);
    } else if (typeof expected === "boolean") {
        return testBooleanLiteral(exp, expected);
    } else if (typeof expected === "string") {
        return testIdentifier(exp, expected);
    } else {
        console.error(`Type of expected not handled. Got ${typeof expected}`);
        return false;
    }
}

function testIntegerLiteral(il, value) {
    if (!(il instanceof ast.IntegerLiteral)) {
        console.error(`Expression is not IntegerLiteral. Got ${il}`);
        console.log(JSON.stringify(il, null, 2))
        return false;
    }
    if (il.Value !== value) {
        console.error(`IntegerLiteral value not ${value}. Got ${il.Value}`);
        return false;
    }
    if (il.TokenLiteral() !== value.toString()) {
        console.error(`IntegerLiteral TokenLiteral not ${value}. Got ${il.TokenLiteral()}`);
        return false;
    }
    return true;
}

function testBooleanLiteral(bo, value) {
    // console.log(JSON.stringify(bo, null, 2))
    if (!(bo instanceof ast.Boolean)) {
        console.error(`Expression is not Boolean. Got ${bo}`);
        return false;
    }

    // なぜかIntegerLiteralと構造が違くなってる
    // JSparser.jsの中で
    // const lit = new ast.IntegerLiteral({ Token: this.curToken });
    // new ast.Boolean({ Token: this.curToken, Value: this.curTokenIs(`TRUE`) });
    // で new の時の渡してるものが異なるのが原因っぽい
    if (bo.Token.Value !== value) { 
        console.error(`Boolean value not ${value}. Got ${bo.Token.Value}`);
        return false;
    }
    if (bo.TokenLiteral() !== value.toString()) {
        console.error(`Boolean TokenLiteral not ${value}. Got ${bo.TokenLiteral()}`);
        return false;
    }
    return true;
}

function testIdentifier(ident, value) {
    if (!(ident instanceof ast.Identifier)) {
        console.error(`Expression is not Identifier. Got ${ident}`);
        return false;
    }
    if (ident.Token.Value !== value) {
        console.error(`Identifier value not ${value}. Got ${ident.Token.Value}`);
        return false;
    }
    if (ident.TokenLiteral() !== value) {
        console.error(`Identifier TokenLiteral not ${value}. Got ${ident.TokenLiteral()}`);
        return false;
    }
    return true;
}

// Add other test functions as needed...

// Run the test functions
// testReturnStatements();
// testLoopExpression();
testFloatLiteralExpression();