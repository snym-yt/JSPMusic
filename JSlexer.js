const { keywords } = require('./JStoken');

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.readPosition = 0;
        this.ch = '';

        // 最初の文字を読み取る
        this.readChar();
    }

    readChar() {
        if (this.readPosition >= this.input.length) {
            // lexer.goではbyte型となっているので=0だが，ここでは文字列としてしてるので`\0`
            this.ch = '\0'; // Null character
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition++;
    }

    skipWhitespace() {
        while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
            this.readChar();
        }
    }

    peekChar() {
        if (this.readPosition >= this.input.length) {
            return '\0';
        } else {
            return this.input[this.readPosition];
        }
    }

    readString() {
        const position = this.position + 1;
        while (true) {
            this.readChar();
            if (this.ch === '"' || this.ch === '\0') {
                break;
            }
        }
        return this.input.substring(position, this.position);
    }

    readIdentifier() {
        const position = this.position;
        while (this.isLetter(this.ch)) {
            this.readChar();
        }
        return this.input.substring(position, this.position);
    }

    readNumber() {
        const position = this.position;
        while (this.isDigit(this.ch)) {
            this.readChar();
        }
        return this.input.substring(position, this.position);
    }

    isLetter(ch) {
        return /[a-zA-Z_]/.test(ch);
    }

    isDigit(ch) {
        return /[0-9]/.test(ch);
    }

    nextToken() {
        this.skipWhitespace();

        let tok = { type: '', literal: '' };

        switch (this.ch) {
            case '=':
                if (this.peekChar() === '=') {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = { type: 'EQ', literal: literal };
                } else {
                    tok = { type: 'ASSIGN', literal: this.ch };
                }
                break;
            case '+':
                tok = { type: 'PLUS', literal: this.ch };
                break;
            case '-':
                tok = { type: 'MINUS', literal: this.ch };
                break;
            case '!':
                if (this.peekChar() === '=') {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = { type: 'NOT_EQ', literal: literal };
                } else {
                    tok = { type: 'BANG', literal: this.ch };
                }
                break;
            case '/':
                tok = { type: 'SLASH', literal: this.ch };
                break;
            case '*':
                tok = { type: 'ASTERISK', literal: this.ch };
                break;
            case '^':
                tok = { type: 'HAT', literal: this.ch };
                break;
            case '<':
                tok = { type: 'LT', literal: this.ch };
                break;
            case '>':
                tok = { type: 'GT', literal: this.ch };
                break;
            case ';':
                tok = { type: 'SEMICOLON', literal: this.ch };
                break;
            case ':':
                tok = { type: 'COLON', literal: this.ch };
                break;
            case '(':
                tok = { type: 'LPAREN', literal: this.ch };
                break;
            case ')':
                tok = { type: 'RPAREN', literal: this.ch };
                break;
            case ',':
                tok = { type: 'COMMA', literal: this.ch };
                break;
            case '{':
                tok = { type: 'LBRACE', literal: this.ch };
                break;
            case '}':
                tok = { type: 'RBRACE', literal: this.ch };
                break;
            case '[':
                tok = { type: 'LBRACKET', literal: this.ch };
                break;
            case ']':
                tok = { type: 'RBRACKET', literal: this.ch };
                break;
            case '"':
                const strLiteral = this.readString();
                tok = { type: 'STRING', literal: strLiteral };
                break;
            case '\0':
                tok = { type: 'EOF', literal: '' };
                break;
            default:
                if (this.isLetter(this.ch)) {
                    const ident = this.readIdentifier();
                    const identType = keywords[ident] || 'IDENT';
                    tok = { type: identType, literal: ident };
                    return tok;
                } else if (this.isDigit(this.ch)) {
                    const numLiteral = this.readNumber();
                    if (this.ch === '.') {
                        const ch = numLiteral; // part of int
                        const literal = ch + this.ch; // add point
                        this.readChar();
                        const fractionalPart = this.readNumber();
                        tok = { type: 'FLOAT', literal: literal + fractionalPart };
                    } else {
                        tok = { type: 'INT', literal: numLiteral };
                    }
                    return tok;
                } else {
                    tok = { type: 'ILLEGAL', literal: this.ch };
                }
        }

        this.readChar();
        return tok;
    }
}


function newLexer(input) {
    return new Lexer(input);
}
module.exports = { newLexer };