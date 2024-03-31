const token = require("./JStoken");

class Node {
  TokenLiteral() {
    return "";
  }

  String() {
    return "";
  }
}

class Statement extends Node {
  statementNode() {}
}

class Expression extends Node {
  expressionNode() {}
}

class Program {
  constructor(statements = []) {
    this.Statements = statements;
  }

  TokenLiteral() {
    if (this.Statements.length > 0) {
      return this.Statements[0].TokenLiteral();
    } else {
      return "";
    }
  }

  String() {
    return this.Statements.map((s) => s.String()).join("");
  }
}

class VarStatement extends Statement {
  constructor(token, name, value) {
    super();
    this.Token = token;
    this.Name = name;
    this.Value = value;
  }

  statementNode() {}

  TokenLiteral() {
    return this.Token.literal;
  }

  String() {
    let out = `${this.TokenLiteral()} ${this.Name.String()} = `;
    if (this.Value !== null) {
      out += this.Value.String();
    }
    out += ";";
    return out;
  }
}

class ReturnStatement extends Statement {
  constructor(token, returnValue) {
    super();
    this.Token = token;
    this.ReturnValue = returnValue;
  }

  // ここ二つ勝手に追加した
  statementNode() {}

  TokenLiteral() {
    return this.Token.Token.literal;
  }

  String() {
    let out = `${this.TokenLiteral()} `;
    if (this.ReturnValue !== null) {
      out += this.ReturnValue.String();
    }
    out += ";";
    return out;
  }
}

class Identifier extends Expression {
  constructor(token, value) {
    super();
    this.Token = token;
    this.Value = value;
  }

  expressionNode() {}

  TokenLiteral() {
    return this.Token.Token.literal;
  }

  String() {
    return this.Value;
  }
}

class ExpressionStatement extends Statement {
    constructor(token, expression) {
      super();
      this.Token = token;
      this.Expression = expression;
    }
  
    statementNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      if (this.Expression !== null) {
        return this.Expression.String();
      }
      return "";
    }
}
  
class IntegerLiteral extends Expression {
    constructor(token, value) {
      super();
      this.Token = token;
      this.Value = value;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.Token.literal;
    }
  
    String() {
      return this.Token.literal;
    }
  }

class PrefixExpression extends Expression {
  constructor(token, operator, right) {
    super();
    this.Token = token;
    this.Operator = operator;
    this.Right = right;
  }

  expressionNode() {}

  TokenLiteral() {
    return this.Token.literal;
  }

  String() {
    return `(${this.Operator}${this.Right.String()})`;
  }
}

class InfixExpression extends Expression {
    constructor(token, left, operator, right) {
      super();
      this.Token = token;
      this.Left = left;
      this.Operator = operator;
      this.Right = right;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      return `(${this.Left.String()} ${this.Operator} ${this.Right.String()})`;
    }
}

class Boolean extends Expression {
    constructor(token, value) {
      super();
      this.Token = token;
      this.Value = value;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.Token.literal;
    }
  
    String() {
      return this.Token.literal;
    }
}

class IfExpression extends Expression {
    constructor(token, condition, consequence, alternative) {
      super();
      this.Token = token;
      this.Condition = condition;
      this.Consequence = consequence;
      this.Alternative = alternative;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      let out = "if ";
      out += this.Condition.String();
      out += " ";
      out += this.Consequence.String();
      if (this.Alternative !== null) {
        out += " else ";
        out += this.Alternative.String();
      }
      return out;
    }
}
  
class BlockStatement extends Node {
    constructor(token, statements = []) {
      super();
      this.Token = token;
      this.Statements = statements;
    }
  
    statementNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      let out = "";
      for (const statement of this.Statements) {
        out += statement.String();
      }
      return out;
    }
}

class FunctionLiteral extends Expression {
    constructor(token, parameters = [], body) {
      super();
      this.Token = token;
      this.Parameters = parameters;
      this.Body = body;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      let out = this.TokenLiteral() + "(";
      out += this.Parameters.map((param) => param.String()).join(", ");
      out += ")";
      out += this.Body.String();
      return out;
    }
}
  
class CallExpression extends Expression {
    constructor(token, funcExpr, argumentsList = []) {
      super();
      this.Token = token;
      this.Function = funcExpr;
      this.Arguments = argumentsList;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      let out = this.Function.String() + "(";
      out += this.Arguments.map((arg) => arg.String()).join(", ");
      out += ")";
      return out;
    }
}

class StringLiteral extends Expression {
    constructor(token, value) {
      super();
      this.Token = token;
      this.Value = value;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      return this.Token.literal;
    }
}

class ArrayLiteral extends Expression {
    constructor(token, elements) {
      super();
      this.Token = token;
      this.Elements = elements;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      const elementsString = this.Elements.map(el => el.String()).join(", ");
      return `[${elementsString}]`;
    }
}

class IndexExpression extends Expression {
    constructor(token, left, index) {
      super();
      this.Token = token;
      this.Left = left;
      this.Index = index;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
        // 終端の）あったらだめかも
      return `(${this.Left.String()}[${this.Index.String()}])`;
    }
}
  
class HashLiteral extends Expression {
    constructor(token, pairs) {
      super();
      this.Token = token;
      this.Pairs = pairs;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.literal;
    }
  
    String() {
      const pairs = Object.entries(this.Pairs).map(([key, value]) => `${key.String()}:${value.String()}`);
      return `{${pairs.join(", ")}}`;
    }
}
  
  
class WhileExpression extends Expression {
    constructor(token, condition, consequence) {
      super();
      this.Token = token;
      this.Condition = condition;
      this.Consequence = consequence;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return 'while';
    }
  
    String() {
      return `while ${this.Condition.String()} ${this.Consequence.String()}`;
    }
  }
  
class FloatLiteral extends Expression {
    constructor(token, value) {
      super();
      this.Token = token;
      this.Value = value;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return this.Token.Token.literal;
    }
  
    String() {
      return this.Token.Token.literal;
    }
}
  
class LoopExpression extends Expression {
    constructor(token, condition, consequence) {
      super();
      this.Token = token;
      this.Condition = condition;
      this.Consequence = consequence;
    }
  
    expressionNode() {}
  
    TokenLiteral() {
      return 'loop';
    }
  
    String() {
      return `loop ${this.Condition.String()} ${this.Consequence.String()}`;
    }
}
  
  
  


module.exports = {
  Node,
  Statement,
  Expression,
  Program,
  VarStatement,
  ReturnStatement,
  Identifier,
  IntegerLiteral,
  ExpressionStatement,
  PrefixExpression,
  InfixExpression,
  Boolean,
  IfExpression,
  BlockStatement,
  FunctionLiteral,
  CallExpression,
  StringLiteral,
  ArrayLiteral,
  IndexExpression,
  HashLiteral,
  WhileExpression,
  FloatLiteral,
  LoopExpression,
};
