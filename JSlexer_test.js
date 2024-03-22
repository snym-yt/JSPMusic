const { newLexer } = require('./JSlexer');

const input = `var five = 5;
var ten = 10;

var add = fn(x,y){
    x + y;
};
var result = add(five, ten);
!-/*5;
5 < 10 > 5;

if(5 < 10){
    return true;
}else{
    return false;
}

10 == 10;
10 != 9;
"foobar"
"foo bar"
[1,2];
{"foo":"bar"}
var d = 3.4;
1.2 < 3.4;
[1.2, 3.4];
loop(4){
    return true;
}`;

const tests = [
    { expectedType: 'VAR', expectedLiteral: 'var' },
    { expectedType: 'IDENT', expectedLiteral: 'five' },
    { expectedType: 'ASSIGN', expectedLiteral: '=' },
    { expectedType: 'INT', expectedLiteral: '5' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'VAR', expectedLiteral: 'var' },
    { expectedType: 'IDENT', expectedLiteral: 'ten' },
    { expectedType: 'ASSIGN', expectedLiteral: '=' },
    { expectedType: 'INT', expectedLiteral: '10' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'VAR', expectedLiteral: 'var' },
    { expectedType: 'IDENT', expectedLiteral: 'add' },
    { expectedType: 'ASSIGN', expectedLiteral: '=' },
    { expectedType: 'FUNCTION', expectedLiteral: 'fn' },
    { expectedType: 'LPAREN', expectedLiteral: '(' },
    { expectedType: 'IDENT', expectedLiteral: 'x' },
    { expectedType: 'COMMA', expectedLiteral: ',' },
    { expectedType: 'IDENT', expectedLiteral: 'y' },
    { expectedType: 'RPAREN', expectedLiteral: ')' },
    { expectedType: 'LBRACE', expectedLiteral: '{' },
    { expectedType: 'IDENT', expectedLiteral: 'x' },
    { expectedType: 'PLUS', expectedLiteral: '+' },
    { expectedType: 'IDENT', expectedLiteral: 'y' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'RBRACE', expectedLiteral: '}' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'VAR', expectedLiteral: 'var' },
    { expectedType: 'IDENT', expectedLiteral: 'result' },
    { expectedType: 'ASSIGN', expectedLiteral: '=' },
    { expectedType: 'IDENT', expectedLiteral: 'add' },
    { expectedType: 'LPAREN', expectedLiteral: '(' },
    { expectedType: 'IDENT', expectedLiteral: 'five' },
    { expectedType: 'COMMA', expectedLiteral: ',' },
    { expectedType: 'IDENT', expectedLiteral: 'ten' },
    { expectedType: 'RPAREN', expectedLiteral: ')' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'BANG', expectedLiteral: '!' },
    { expectedType: 'MINUS', expectedLiteral: '-' },
    { expectedType: 'SLASH', expectedLiteral: '/' },
    { expectedType: 'ASTERISK', expectedLiteral: '*' },
    { expectedType: 'INT', expectedLiteral: '5' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'INT', expectedLiteral: '5' },
    { expectedType: 'LT', expectedLiteral: '<' },
    { expectedType: 'INT', expectedLiteral: '10' },
    { expectedType: 'GT', expectedLiteral: '>' },
    { expectedType: 'INT', expectedLiteral: '5' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'IF', expectedLiteral: 'if' },
    { expectedType: 'LPAREN', expectedLiteral: '(' },
    { expectedType: 'INT', expectedLiteral: '5' },
    { expectedType: 'LT', expectedLiteral: '<' },
    { expectedType: 'INT', expectedLiteral: '10' },
    { expectedType: 'RPAREN', expectedLiteral: ')' },
    { expectedType: 'LBRACE', expectedLiteral: '{' },
    { expectedType: 'RETURN', expectedLiteral: 'return' },
    { expectedType: 'TRUE', expectedLiteral: 'true' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'RBRACE', expectedLiteral: '}' },
    { expectedType: 'ELSE', expectedLiteral: 'else' },
    { expectedType: 'LBRACE', expectedLiteral: '{' },
    { expectedType: 'RETURN', expectedLiteral: 'return' },
    { expectedType: 'FALSE', expectedLiteral: 'false' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'RBRACE', expectedLiteral: '}' },
    { expectedType: 'INT', expectedLiteral: '10' },
    { expectedType: 'EQ', expectedLiteral: '==' },
    { expectedType: 'INT', expectedLiteral: '10' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'INT', expectedLiteral: '10' },
    { expectedType: 'NOT_EQ', expectedLiteral: '!=' },
    { expectedType: 'INT', expectedLiteral: '9' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'STRING', expectedLiteral: 'foobar' },
    { expectedType: 'STRING', expectedLiteral: 'foo bar' },
    { expectedType: 'LBRACKET', expectedLiteral: '[' },
    { expectedType: 'INT', expectedLiteral: '1' },
    { expectedType: 'COMMA', expectedLiteral: ',' },
    { expectedType: 'INT', expectedLiteral: '2' },
    { expectedType: 'RBRACKET', expectedLiteral: ']' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'LBRACE', expectedLiteral: '{' },
    { expectedType: 'STRING', expectedLiteral: 'foo' },
    { expectedType: 'COLON', expectedLiteral: ':' },
    { expectedType: 'STRING', expectedLiteral: 'bar' },
    { expectedType: 'RBRACE', expectedLiteral: '}' },
    { expectedType: 'VAR', expectedLiteral: 'var' },
    { expectedType: 'IDENT', expectedLiteral: 'd' },
    { expectedType: 'ASSIGN', expectedLiteral: '=' },
    { expectedType: 'FLOAT', expectedLiteral: '3.4' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'FLOAT', expectedLiteral: '1.2' },
    { expectedType: 'LT', expectedLiteral: '<' },
    { expectedType: 'FLOAT', expectedLiteral: '3.4' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'LBRACKET', expectedLiteral: '[' },
    { expectedType: 'FLOAT', expectedLiteral: '1.2' },
    { expectedType: 'COMMA', expectedLiteral: ',' },
    { expectedType: 'FLOAT', expectedLiteral: '3.4' },
    { expectedType: 'RBRACKET', expectedLiteral: ']' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'LOOP', expectedLiteral: 'loop' },
    { expectedType: 'LPAREN', expectedLiteral: '(' },
    { expectedType: 'INT', expectedLiteral: '4' },
    { expectedType: 'RPAREN', expectedLiteral: ')' },
    { expectedType: 'LBRACE', expectedLiteral: '{' },
    { expectedType: 'RETURN', expectedLiteral: 'return' },
    { expectedType: 'TRUE', expectedLiteral: 'true' },
    { expectedType: 'SEMICOLON', expectedLiteral: ';' },
    { expectedType: 'RBRACE', expectedLiteral: '}' },
    { expectedType: 'EOF', expectedLiteral: '' },
];

const l = newLexer(input);

for (var i = 0; i < tests.length; i++) {
    const tt = tests[i];
    const tok = l.nextToken();

    if (tok.type !== tt.expectedType) {
        console.error(`tests[${i}] - tokentype wrong. expected=${tt.expectedType}, got=${tok.type}`);
    }

    if (tok.literal !== tt.expectedLiteral) {
        console.error(`tests[${i}] - literal wrong. expected=${tt.expectedLiteral}, got=${tok.literal}`);
    }
}
