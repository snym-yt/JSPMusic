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
        { input: "return 5 ;", expectedValue: 5 },
        { input: "return true;", expectedValue: true },
        { input: "return y;", expectedValue: "y" },
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

function testLoopExpression2() {
    const tests = [
        `loop(10){\
            play(60, 0.1);\
            play(0, 0.0);\
            play(0, 0.0);\
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

        const exp = stmt.Expression;
        // console.log("exp.TokenLiteral() is " + exp.TokenLiteral());
        if (!(exp instanceof ast.LoopExpression)) {
            console.error(`stmt.Expression is not LoopExpression. Got ${exp.TokenLiteral()}`);
            continue;
        }

        if (!(testIntegerLiteral(exp.Condition, 10))){
            console.error(`exp.Condition is Error.`);
            continue;
        }

        if (exp.Consequence.Statements.length != 3){
            console.error(`Consequence is not 3 statements. Got ${length(exp.Consequence.Statements)}`)
        }

        let consequence = exp.Consequence.Statements[0]
        if (!(consequence instanceof ast.ExpressionStatement)) {
            console.error(`first consequence is not ExpressionStatement. Got ${consequence.TokenLiteral()}`);
            continue;
        }

        consequence = exp.Consequence.Statements[1]
        if (!(consequence instanceof ast.ExpressionStatement)) {
            console.error(`second consequence is not ExpressionStatement. Got ${consequence.TokenLiteral()}`);
            continue;
        }

        consequence = exp.Consequence.Statements[2]
        if (!(consequence instanceof ast.ExpressionStatement)) {
            console.error(`third consequence is not ExpressionStatement. Got ${consequence.TokenLiteral()}`);
            continue;
        }
    }

    console.log("testWhileExpression2 passed successfully.");
}

function testWhileExpression() {
    const tests = [
        `while(true) {\
             play(60, 0.5);\
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
        if (!(exp instanceof ast.WhileExpression)) {
            console.error(`stmt.Expression is not ast.WhileExpression. Got ${exp.TokenLiteral()}`);
            continue;
        }

        if (!(testBooleanLiteral(exp.Condition, true))){
            console.error(`exp.Condition is Error.`);
            continue;
        }

        if (exp.Consequence.Statements.length != 1){
            console.error(`Consequence is not 1 statements. Got ${exp.Consequence.Statements.length}`)
        }

        const consequence = exp.Consequence.Statements[0]
        if (!(consequence instanceof ast.ExpressionStatement)) {
            console.error(`consequence is not ast.ReturnStatement. Got ${consequence.TokenLiteral()}`);
            continue;
        }

    }

    console.log("testWhileExpression passed successfully.");

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

function testIfElseExpression() {
    const input = `if (1+2 < y) {return true;} else {y}`;

    const l = newLexer(input);
    const p = newParser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    if (program.Statements.length !== 1) {
        console.error(`program.Statements[0] does not contain 1 statements. Got ${program.Statements.length}`);
        return;
    }

    const stmt = program.Statements[0];
    if (!(stmt instanceof ast.ExpressionStatement)) {
        console.error(`program.Statements[0] is not ast.ExpressionStatement. Got ${typeof stmt.Expression}`);
        return;
    }

    const exp = stmt.Expression;
    if (!(exp instanceof ast.IfExpression)) {
        console.error(`stmt.Expression is not ast.IfExpression. Got ${typeof exp}`);
        return;
    }

    console.log("\nexp.Condition is \n" + JSON.stringify(exp.Condition, null, 2))
    if (!testInfixExpression(exp.Condition, "x", "<", "y")) {
        return;
    }

    if (exp.Consequence.Statements.length !== 1) {
        console.error(`Consequence is not 1 statements. Got ${exp.Consequence.Statements.length}`);
        return;
    }

    const consequence = exp.Consequence.Statements[0];
    if (!(consequence instanceof ast.ExpressionStatement)) {
        console.error(`Statements[0] is not ast.ExpressionStatement. Got ${typeof consequence}`);
        return;
    }

    console.log("\nconsequence is \n" + JSON.stringify(consequence, null, 2))
    if (!testIdentifier(consequence.Expression, "x")) {
        return;
    }

    if (exp.Alternative === null) {
        console.error(`exp.Alternative.Statements was null. Got ${exp.Alternative}`);
        return;
    }

    if (exp.Alternative.Statements.length !== 1) {
        console.error(`Alternative is not 1 statements. Got ${exp.Consequence.Statements.length}`);
        return;
    }

    const alternative = exp.Alternative.Statements[0];
    if (!(alternative instanceof ast.ExpressionStatement)) {
        console.error(`Statements[0] is not ast.ExpressionStatement. Got ${typeof alternative}`);
        return;
    }

    if (!testIdentifier(alternative.Expression, "y")) {
        return;
    }

    console.log("testIfElseExpression passed successfully.");
}

function testOperatorPrecedenceParsing() {
    const tests = [
        // { input: "true", expected: "true" },
        // { input: "false", expected: "false" },
        // { input: "3 > 5 == false", expected: "((3 < 5) == true)" },
        { input: "1 + (2 + 3) + 4", expected: "((1 + (2 + 3)) + 4)" },
        { input: "(5 + 5) * 2", expected: "((5 + 5) * 2)" },
        { input: "2 / (5+5)", expected: "(-(5 + 5))" },
        { input: "!(true == true)", expected: "(!(true == true))" },
    ];

    for (const tt of tests) {
        const l = newLexer(tt.input);
        const p = newParser(l);
        const program = p.parseProgram();
        checkParserErrors(p);
        console.log("\n\n");

        if (program.Statements.length !== 1) {
            console.error(`program has not enough statements. Got ${program.Statements.length}`);
        }
    }
    console.log("testOpratorPrecedenceParsing passed successfully.");
}

function testCallExpressionParsing() {
    // const input = "add(1, 2*3, 4+5);";
    const input = "play(60, 0.5);";
    const l = newLexer(input);
    const p = newParser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    if (program.Statements.length !== 1) {
        console.error(`program.Statements does not contain 1 statements. Got ${program.Statements.length}`);
        return;
    }
    const stmt = program.Statements[0];
    if (!(stmt instanceof ast.ExpressionStatement)) {
        console.error(`stmt is not ast.ExpressionStatement. Got ${typeof program.Statements[0]}`);
        return;
    }
    const exp = stmt.Expression;
    if (!(exp instanceof ast.CallExpression)) {
        console.error(`stmt.Expression is not ast.CallExpression. Got ${typeof stmt.Expression}`);
        return;
    }
    if (!testIdentifier(exp.Token.Function, "play")) {
        return;
    }
    if (exp.Arguments.length !== 2) {
        console.error(`wrong length of arguments. Got ${exp.Arguments.length}`);
        return;
    }
    testLiteralExpression(exp.Arguments[0], 60);
    testLiteralExpression(exp.Arguments[1], 0.5);

    // testInfixExpression(exp.Arguments[1], 2, "*", 3);
    // testInfixExpression(exp.Arguments[2], 4, "+", 5);

    console.log("testCallExpressionParsing passed successfully.");

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
        console.error(`program.Statements[0] is not ast.ExpressionStatement. Got ${typeof program.Statements[0]}`);
        return;
    }

    const literal = stmt.Expression;
    if (!(literal instanceof ast.FloatLiteral)) {
        console.error(`exp not ast.FloatLiteral. Got ${typeof stmt.Expression}`);
        return;
    }

    if (literal.TokenLiteral() !== "1.2") {
        console.error(`literal.TokenLiteral not '1.2'. Got ${literal.TokenLiteral()}`);
        return;
    }

    console.log("testFloatLiteralExpression passed successfully.");

}







// ==============================================================================
// ==============================================================================
// ==============================================================================
// ==============================================================================




function testLiteralExpression(exp, expected) {
    if (typeof expected === "number") {
        if (Number.isInteger(expected)) {
            return testIntegerLiteral(exp, expected);
        } else {
            return testFloatLiteral(exp, expected);
        }
    } else if (typeof expected === "boolean") {
        return testBooleanLiteral(exp, expected);
    } else if (typeof expected === "string") {
        console.log(JSON.stringify(exp, null, 2))
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

function testFloatLiteral(fl, value) {
    if (!(fl instanceof ast.FloatLiteral)) {
        console.error(`Expression is not FloatLiteral. Got ${fl}`);
        console.log(JSON.stringify(fl, null, 2))
        return false;
    }
    if (fl.Value !== value) {
        console.error(`FloatLiteral value not ${value}. Got ${fl.Value}`);
        return false;
    }
    if (fl.TokenLiteral() !== value.toString()) {
        console.error(`IntegerLiteral TokenLiteral not ${value}. Got ${fl.TokenLiteral()}`);
        return false;
    }
    return true;
}

function testBooleanLiteral(bo, value) {
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

function testInfixExpression(exp, left, operator, right) {
    const onExp = exp;
    if (!(onExp instanceof ast.InfixExpression)) {
        console.error(`exp is not ast.InfixExpression. Got ${typeof onExp}(${onExp})`);
        return false;
    }

    if (!testLiteralExpression(onExp.Token.Left, left)) {
        return false;
    }

    if (onExp.Token.Operator !== operator) {
        console.error(`exp.Token.Operator is not '${operator}'. Got ${onExp.Token.Operator}`);
        return false;
    }

    if (!testLiteralExpression(onExp.Right, right)) {
        return false;
    }

    return true;
}


// ==============================================================================
// ==============================================================================
// ==============================================================================
// ==============================================================================


// Run the test functions
// testReturnStatements();
// testLoopExpression();
// testFloatLiteralExpression();
// testIfElseExpression();
// testOperatorPrecedenceParsing();
// testCallExpressionParsing();
// testFloatLiteralExpression();
// testWhileExpression();
testLoopExpression2();