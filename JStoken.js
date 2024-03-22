class TokenType {
    constructor(value) {
        this.value = value;
    }
}

class Token {
    constructor(type, literal) {
        this.type = type;
        this.literal = literal;
    }
}

const ILLEGAL = "ILLEGAL"; //未知のトークンや文字を示す
const EOF = "EOF";

//識別子やリテラル
const IDENT = "IDENT"; //関数や変数など
const INT = "INT"; //整数
const STRING = "STRING";
const FLOAT = "FLOAT";

//演算子
const ASSIGN = "=";
const PLUS = "+";
const MINUS = "-";
const BANG = "!";
const ASTERISK = "*";
const SLASH = "/";
const HAT = "^";

const LT = "<";
const GT = ">";

const EQ = "==";
const NOT_EQ = "!=";

//デリミタ(区切り文字)
const COMMA = ",";
const SEMICOLON = ";";
const COLON = ":";

const LPAREN = "(";
const RPAREN = ")";
const LBRACE = "{";
const RBRACE = "}";
const LBRACKET = "[";
const RBRACKET = "]";

//キーワード
const FUNCTION = "FUNCTION";
// const LET = "LET";
const VAR = "VAR";
const TRUE = "TRUE";
const FALSE = "FALSE";
const IF = "IF";
const ELSE = "ELSE";
const RETURN = "RETURN";
const WHILE = "WHILE";
const LOOP = "LOOP";

const keywords = {
    "fn": FUNCTION,
    // "let": LET,
    "var": VAR,
    "true": TRUE,
    "false": FALSE,
    "if": IF,
    "else": ELSE,
    "return": RETURN,
    "loop": LOOP,
    "while": WHILE,
};


// 識別子がキーワードであればそれに対応するトークンタイプを返し、
// そうでなければデフォルトのトークンタイプを返す．
// たとえば、lookupIdent("if") を呼び出すと 
// IF というトークンタイプを持つ TokenType オブジェクトが返される

function lookupIdent(ident) {
    if (keywords.hasOwnProperty(ident)) {
        return new TokenType(keywords[ident]);
    }
    return new TokenType(IDENT);
}

module.exports = { keywords, TokenType };