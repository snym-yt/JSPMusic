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
        { input: "return 5 +1;", expectedValue: 6 },
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
    console.log()
    if (!(il instanceof ast.IntegerLiteral)) {
        console.error(`Expression is not IntegerLiteral. Got ${il}`);
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
    if (!(bo instanceof ast.Boolean)) {
        console.error(`Expression is not Boolean. Got ${bo}`);
        return false;
    }
    if (bo.value !== value) {
        console.error(`Boolean value not ${value}. Got ${bo.value}`);
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
    if (ident.value !== value) {
        console.error(`Identifier value not ${value}. Got ${ident.value}`);
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
testReturnStatements();
