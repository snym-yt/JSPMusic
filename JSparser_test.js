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
        { input: "return 5;", expectedValue: 5 },
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
            console.error(`Statement is not ReturnStatement. Got ${stmt.constructor.name}`);
            continue;
        }

        const returnStmt = stmt;
        if (returnStmt.tokenLiteral() !== "return") {
            console.error(`ReturnStatement tokenLiteral not 'return'. Got ${returnStmt.tokenLiteral()}`);
            continue;
        }

        const returnValue = returnStmt.returnValue;
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
    if (!(il instanceof ast.IntegerLiteral)) {
        console.error(`Expression is not IntegerLiteral. Got ${il.constructor.name}`);
        return false;
    }
    if (il.value !== value) {
        console.error(`IntegerLiteral value not ${value}. Got ${il.value}`);
        return false;
    }
    if (il.tokenLiteral() !== value.toString()) {
        console.error(`IntegerLiteral tokenLiteral not ${value}. Got ${il.tokenLiteral()}`);
        return false;
    }
    return true;
}

function testBooleanLiteral(bo, value) {
    if (!(bo instanceof ast.Boolean)) {
        console.error(`Expression is not Boolean. Got ${bo.constructor.name}`);
        return false;
    }
    if (bo.value !== value) {
        console.error(`Boolean value not ${value}. Got ${bo.value}`);
        return false;
    }
    if (bo.tokenLiteral() !== value.toString()) {
        console.error(`Boolean tokenLiteral not ${value}. Got ${bo.tokenLiteral()}`);
        return false;
    }
    return true;
}

function testIdentifier(ident, value) {
    if (!(ident instanceof ast.Identifier)) {
        console.error(`Expression is not Identifier. Got ${ident.constructor.name}`);
        return false;
    }
    if (ident.value !== value) {
        console.error(`Identifier value not ${value}. Got ${ident.value}`);
        return false;
    }
    if (ident.tokenLiteral() !== value) {
        console.error(`Identifier tokenLiteral not ${value}. Got ${ident.tokenLiteral()}`);
        return false;
    }
    return true;
}

// Add other test functions as needed...

// Run the test functions
testReturnStatements();
