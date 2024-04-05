const ast = require('./JSast');
const lexer = require('./JSlexer');
const token = require('./JStoken');
const { TokenType } = token;

const LOWEST = 0;
const EQUALS = 1;
const LESSGREATER = 2;
const SUM = 3;
const PRODUCT = 4;
const POWER = 5;
const PREFIX = 6;   //-X or !X
const CALL = 7;     //myFunction(X)
const INDEX = 8;    //array[index]


const precedences = {
    [`EQ`]: EQUALS,
    [`NOT_EQ`]: EQUALS,
    [`LT`]: LESSGREATER,
    [`GT`]: LESSGREATER,
    [`PLUS`]: SUM,
    [`MINUS`]: SUM,
    [`SLASH`]: PRODUCT,
    [`ASTERISK`]: PRODUCT,
    [`HAT`]: POWER,
    [`LPAREN`]: CALL,
    [`LBRACKET`]: INDEX,
};

class Parser {
    constructor(l) {
        this.l = l;
        this.errors = [];
        

        this.prefixParseFns = {};
        this.registerPrefix(`IDENT`, this.parseIdentifier);
        this.registerPrefix(`INT`, this.parseIntegerLiteral);
        this.registerPrefix(`BANG`, this.parsePrefixExpression);
        this.registerPrefix(`MINUS`, this.parsePrefixExpression);
        this.registerPrefix(`TRUE`, this.parseBoolean);
        this.registerPrefix(`FALSE`, this.parseBoolean);
        this.registerPrefix(`LPAREN`, this.parseGroupedExpression);
        this.registerPrefix(`IF`, this.parseIfExpression);
        this.registerPrefix(`FUNCTION`, this.parseFunctionLiteral);
        this.registerPrefix(`STRING`, this.parseStringLiteral);
        this.registerPrefix(`LBRACKET`, this.parseArrayLiteral);
        this.registerPrefix(`LBRACE`, this.parseHashLiteral);
        this.registerPrefix(`WHILE`, this.parseWhileExpression);
        this.registerPrefix(`FLOAT`, this.parseFloatLiteral);
        this.registerPrefix(`LOOP`, this.parseLoopExpression);

        this.infixParseFns = {};
        this.registerInfix(`PLUS`, this.parseInfixExpression);
        this.registerInfix(`MINUS`, this.parseInfixExpression);
        this.registerInfix(`SLASH`, this.parseInfixExpression);
        this.registerInfix(`ASTERISK`, this.parseInfixExpression);
        this.registerInfix(`EQ`, this.parseInfixExpression);
        this.registerInfix(`NOT_EQ`, this.parseInfixExpression);
        this.registerInfix(`LT`, this.parseInfixExpression);
        this.registerInfix(`GT`, this.parseInfixExpression);
        this.registerInfix(`HAT`, this.parseInfixExpression);
        this.registerInfix(`LPAREN`, this.parseCallExpression);
        this.registerInfix(`LBRACKET`, this.parseIndexExpression);

        //2つのトークンを読み込む，curToken, peekTokenの両方をセットする
        this.nextToken();
        this.nextToken();
    }

    Errors() {
        return this.errors;
    }

    peekError(t) {
        const msg = `expected next token to be ${t}, got ${this.peekToken.type} instead`;
        this.errors.push(msg);
    }

    nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.nextToken();
        // console.log("new curToken:" + this.curToken + "   new peekToken:" + this.peekToken);
    }

    parseProgram() {
        const program = new ast.Program();
        program.Statements = [];

        
        while (this.curToken.type != "EOF") {
            // console.log("in while of parseProgram()");
            const stmt = this.parseStatement();
            console.log("stmt:" + JSON.stringify(stmt, null, 4))
            if (stmt !== null) {
                program.Statements.push(stmt);
                // console.log("in parseProgram, now program.Statements: " + JSON.stringify(program.Statements, null, 2));
            }
            this.nextToken();
            console.log("in parseProgram, now curToken.type is " + this.curToken.type);
        }
        return program;
    }

    parseStatement() {
        switch (this.curToken.type) {
            case `VAR`:
                return this.parseVarStatement();
            case "RETURN":
                console.log("in case RETURN of parseStatement")
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    parseVarStatement() {
        const stmt = new ast.VarStatement({ Token: this.curToken });
        if (!this.expectPeek(`IDENT`)) {
            return null;
        }
        stmt.Name = new ast.Identifier({ Token: this.curToken, Value: this.curToken.literal });
        if (!this.expectPeek(`ASSIGN`)) {
            return null;
        }
        this.nextToken();
        stmt.Value = this.parseExpression(LOWEST);
        while (!this.peekTokenIs(`SEMICOLON`)) {
            this.nextToken();
        }
        this.nextToken();
        return stmt;
    }

    parseReturnStatement() {
        const stmt = new ast.ReturnStatement({ Token: this.curToken });
        console.log("in praseReturnStatement before nextToken(), curToken.type is " + this.curToken.type)
        this.nextToken();
        console.log("in praseReturnStatement after nextToken(), curToken.type is " + this.curToken.type + ",  peekToken.type is " + this.peekToken.type)
        stmt.ReturnValue = this.parseExpression(LOWEST);
        console.log("in praseReturnStatement after nextToken(), now peekToken.type is " + this.peekToken.type)
        while (!this.peekTokenIs("SEMICOLON")) {
            this.nextToken();
            console.log("in parseReturnStatement↓\nnew curToken:" + this.curToken.type + "   new peekToken:" + this.peekToken.type);
        }
        this.nextToken();
        return stmt;
    }

    parseExpressionStatement() {
        console.log("start praseExpressionStatement, curToken.type is " + this.curToken.type)
        const stmt = new ast.ExpressionStatement({ Token: this.curToken });
        stmt.Expression = this.parseExpression(LOWEST);
        if (this.peekTokenIs(`SEMICOLON`)) {
            this.nextToken();
        }
        return stmt;
    }

    parseExpression(precedence) {
        const prefix = this.prefixParseFns[this.curToken.type];
        console.log(prefix);
        if (!prefix) {
            this.noPrefixParseFnError(this.curToken.type);
            return null;
        }
        let leftExp = prefix.bind(this)();
        console.log("in parseExpression, this.peekTokenIs(`SEMICOLON`) is " + this.peekTokenIs(`SEMICOLON`) + ",  this.peekToken.type is " + this.peekToken.type);
        console.log("in parseExpression, precedence is " + precedence + "   this.peekPrecedence() is " + this.peekPrecedence());

        while (!this.peekTokenIs(`SEMICOLON`) && precedence < this.peekPrecedence()) {
            console.log("[while in parseExpression]");
            const infix = this.infixParseFns[this.peekToken.type];
            console.log(infix);
            if (!infix) {
                console.log("!infix");
                return leftExp;
            }
            this.nextToken();
            leftExp = infix.bind(this)(leftExp);
        }
        // console.log("in parseExpression, next return leftExp;")
        return leftExp;
    }

    noPrefixParseFnError(t) {
        const msg = `no prefix parse function for ${t} found`;
        this.errors.push(msg);
    }

    parseIdentifier() {
        return new ast.Identifier({ Token: this.curToken, Value: this.curToken.literal });
    }

    parseIntegerLiteral() {
        console.log("in praseIntegerLiteral, curToken.type is " + this.curToken.type + ", curToken.literal is " + this.curToken.literal)
        const lit = new ast.IntegerLiteral({ Token: this.curToken });
        const value = parseInt(this.curToken.literal, 10);  // stringをint(10進数)に
        // console.log(value);
        if (isNaN(value)) {
            const msg = `could not parse ${this.curToken.literal} as integer`;
            this.errors.push(msg);
            return null;
        }
        lit.Value = value;
        console.log("in parseIntegerLiteral, lit.Value is " + lit.Value);
        return lit;
    }

    curTokenIs(t) {
        return this.curToken.type === t;
    }

    peekTokenIs(t) {
        // console.log("in peekTokenIs, now peekToken.type is " + this.peekToken.type);
        return this.peekToken.type === t;
    }

    expectPeek(t) {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(t);
            return false;
        }
    }

    registerPrefix(tokenType, fn) {
        this.prefixParseFns[tokenType] = fn;
    }

    registerInfix(tokenType, fn) {
        this.infixParseFns[tokenType] = fn;
    }

    parsePrefixExpression() {
        const expression = new ast.PrefixExpression({
            Token: this.curToken,
            Operator: this.curToken.literal,
        });
        this.nextToken();
        expression.Right = this.parseExpression(PREFIX);
        return expression;
    }

    peekPrecedence() {
        console.log("in peekPrecedence(), this.peekToken.type is " + this.peekToken.type);
        const precedence = precedences[this.peekToken.type];
        return precedence || LOWEST;
    }

    curPrecedence() {
        const precedence = precedences[this.curToken.type];
        return precedence || LOWEST;
    }

    parseInfixExpression(left) {
        const expression = new ast.InfixExpression({
            Token: this.curToken,
            Operator: this.curToken.literal,
            Left: left,
        });
        const precedence = this.curPrecedence();
        this.nextToken();
        expression.Right = this.parseExpression(precedence);
        return expression;
    }

    parseBoolean() {
        return new ast.Boolean({ Token: this.curToken, Value: this.curTokenIs(`TRUE`) });
    }

    parseGroupedExpression() {
        this.nextToken();
        const exp = this.parseExpression(LOWEST);
        if (!this.expectPeek(`RPAREN`)) {
            console.log(`in parseGroupedExpression, this.expectReek('RPAREN') is true`)
            return null;
        }
        return exp;
    }

    parseIfExpression() {
        const expression = new ast.IfExpression({ Token: this.curToken });
        if (!this.expectPeek(`LPAREN`)) {
            return null;
        }
        this.nextToken();
        expression.Condition = this.parseExpression(LOWEST);
        if (!this.expectPeek(`RPAREN`)) {
            return null;
        }
        if (!this.expectPeek(`LBRACE`)) {
            return null;
        }
        expression.Consequence = this.parseBlockStatement();
        if (this.peekTokenIs(`ELSE`)) {
            this.nextToken();
            if (!this.expectPeek(`LBRACE`)) {
                return null;
            }
            expression.Alternative = this.parseBlockStatement();
        }
        return expression;
    }

    parseBlockStatement() {
        const block = new ast.BlockStatement({ Token: this.curToken });
        block.Statements = [];
        this.nextToken();
        while (!this.curTokenIs(`RBRACE`) && !this.curTokenIs(`EOF`)) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                block.Statements.push(stmt);
            }
            this.nextToken();
        }
        return block;
    }

    parseFunctionLiteral() {
        const lit = new ast.FunctionLiteral({ Token: this.curToken });
        if (!this.expectPeek(`LPAREN`)) {
            return null;
        }
        lit.Parameters = this.parseFunctionParameters();
        if (!this.expectPeek(`LBRACE`)) {
            return null;
        }
        lit.Body = this.parseBlockStatement();
        return lit;
    }

    parseFunctionParameters() {
        const identifiers = [];
        if (this.peekTokenIs(`RPAREN`)) {
            this.nextToken();
            return identifiers;
        }
        this.nextToken();
        const ident = new ast.Identifier({ Token: this.curToken, Value: this.curToken.literal });
        identifiers.push(ident);
        while (this.peekTokenIs(`COMMA`)) {
            this.nextToken();
            this.nextToken();
            const ident = new ast.Identifier({ Token: this.curToken, Value: this.curToken.literal });
            identifiers.push(ident);
        }
        if (!this.expectPeek(`RPAREN`)) {
            return null;
        }
        return identifiers;
    }

    parseCallExpression(func) {
        const exp = new ast.CallExpression({ Token: this.curToken, Function: func });
        exp.Arguments = this.parseExpressionList(`RPAREN`);
        return exp;
    }

    parseStringLiteral() {
        return new ast.StringLiteral({ Token: this.curToken, Value: this.curToken.literal });
    }

    parseArrayLiteral() {
        const array = new ast.ArrayLiteral({ Token: this.curToken });
        array.Elements = this.parseExpressionList(`]`);
        return array;
    }

    parseExpressionList(end) {
        const list = [];
        if (this.peekTokenIs(end)) {
            this.nextToken();
            return list;
        }
        this.nextToken();
        list.push(this.parseExpression(LOWEST));
        while (this.peekTokenIs(`COMMA`)) {
            console.log("---------------------------------------------------")
            this.nextToken();
            this.nextToken();
            list.push(this.parseExpression(LOWEST));
        }
        if (!this.expectPeek(end)) {
            return null;
        }
        return list;
    }

    parseIndexExpression(left) {
        const exp = new ast.IndexExpression({ Token: this.curToken, Left: left });
        this.nextToken();
        exp.Index = this.parseExpression(LOWEST);
        if (!this.expectPeek(`RBRACKET`)) {
            return null;
        }
        return exp;
    }

    parseHashLiteral() {
        const hash = new ast.HashLiteral({ Token: this.curToken });
        hash.Pairs = new Map();
        while (!this.peekTokenIs(`RBRACE`)) {
            this.nextToken();
            const key = this.parseExpression(LOWEST);
            if (!this.expectPeek(`COLON`)) {
                return null;
            }
            this.nextToken();
            const value = this.parseExpression(LOWEST);
            hash.Pairs.set(key, value);
            if (!this.peekTokenIs(`RBRACE`) && !this.expectPeek(`,`)) {
                return null;
            }
        }
        if (!this.expectPeek(`}`)) {
            return null;
        }
        return hash;
    }

    parseWhileExpression() {
        const expression = new ast.WhileExpression({ Token: this.curToken });
        if (!this.expectPeek(`LPAREN`)) {
            return null;
        }
        this.nextToken();
        expression.Condition = this.parseExpression(LOWEST);
        if (!this.expectPeek(`RPAREN`)) {
            return null;
        }
        if (!this.expectPeek(`LBRACE`)) {
            return null;
        }
        expression.Consequence = this.parseBlockStatement();
        return expression;
    }

    parseFloatLiteral() {
        const lit = new ast.FloatLiteral({ Token: this.curToken });
        const value = parseFloat(this.curToken.literal);
        if (isNaN(value)) {
            const msg = `could not parse ${this.curToken.literal} as float`;
            this.errors.push(msg);
            return null;
        }
        lit.Value = value;
        return lit;
    }

    parseLoopExpression() {
        const expression = new ast.LoopExpression({ Token: this.curToken });
        if (!this.expectPeek(`LPAREN`)) {
            return null;
        }
        this.nextToken();
        expression.Condition = this.parseExpression(LOWEST);
        if (!this.expectPeek(`RPAREN`)) {
            return null;
        }
        if (!this.expectPeek(`LBRACE`)) {
            return null;
        }
        expression.Consequence = this.parseBlockStatement();
        return expression;
    }
}

function newParser(l) {
    return new Parser(l);
}

module.exports = { newParser, Parser };
