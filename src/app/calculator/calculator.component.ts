import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    this.textKeyPress(event);
  }

  constructor() { }

  ngOnInit(): void {
  }

  text = "0";

/*
    Simple calculator that evaluates expressions using the shunting yard algorithm
    Text is entered using the buttons or keyboard input then parsed when the user hits enter
*/

  // List of characters that can be typed into the text box.
  validChars =  [")", "(", "^", "*", "/", "+", "-", ".", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  numberChars = [".", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  operators = [")", "(", "^", "*", "/", "+", "-"];
  operatorPrecedence = {"+": 1, "-": 1, "*": 2, "/": 2, "^": 3};

  printTextValue() {
    console.log("Text: " + this.text);
  }

  tokenize(expr) {
    var start = 0, end = 0;
    var tokens = [];
    
    var lastCharOp = true;

    while (end < expr.length) {
      // Grab numbers.
      if (this.numberChars.includes(expr[end]) || (lastCharOp && expr[end] === "-")) {
        while (this.numberChars.includes(expr[end]) || (lastCharOp && expr[end] === "-")) { 
          end++;
          lastCharOp = false;
        }
        
        tokens.push(expr.substring(start, end));
      }
      
      // Grab operators.
      if (this.operators.includes(expr[end])) {
        tokens.push(expr.substring(end, ++end));
        lastCharOp = true;
      }
      start = end;
      
    }
    return tokens;
  }

  opPrec(op) {
      return this.operatorPrecedence[op];
  }

  // Returns a list of operators and operands in reverse polish notation.
  shuntingYard(expr) {
    var tokens = this.tokenize(expr);
    var opStack = [];
    var outputQueue = [];

    while (tokens.length > 0) {
      var token = tokens.shift(); // Remove element from the beginning.
      // If token is a number add it to the queue
      if (this.numberChars.includes(token[0]) || (token.length >= 2 && token[0] === "-" && this.numberChars.includes(token[1]))) {
        
        outputQueue.push(token);
      } else if (token[0] === "(") {
        opStack.push(token);
      } else if (token[0] === ")") {
        while (opStack[opStack.length - 1] !== "(") {
          var o = opStack.pop();
          outputQueue.push(o);
        }
        opStack.pop();
      } else { // Otherwise it is an operator; check precedence.
        while (opStack.length > 0 && this.opPrec(token) < this.opPrec(opStack[opStack.length - 1])) {
          var o = opStack.pop();
          outputQueue.push(o);
        }
        opStack.push(token);
      }
              
      }
      while (opStack.length > 0) {
        var o = opStack.pop();
        outputQueue.push(o);
      }
      return outputQueue;
  }

  evaluate() {
      
    var reversePolish = this.shuntingYard(this.text);
    var s = [];

    while (reversePolish.length > 0) {
      var t = reversePolish.shift();
      if (this.numberChars.includes(t[0]) || (t.length >= 2 && t[0] === "-" && this.numberChars.includes(t[1])))
        s.push(t);
      else {
        var b = parseFloat(s.pop()); // a <op> b.
        var a = parseFloat(s.pop());
        var result = 0;
        if (t === "+")
          result = a + b;
        else if (t === "-")
          result = a - b;
        else if (t === "*")
          result = a * b;
        else if (t === "/")
          result = a / b;
        else if (t === "^")
          result = Math.pow(a, b);
        s.push(result.toString());
      }
    }

    this.text = s[0].toString();
  }

  textKeyPress = (e) => {
    if (e.key === "Escape") {
      this.clearText();
      return false;
    }
    else if (e.key === "Backspace") {
      this.backspace();
      return false;
    }
    else if (e.key === "Enter") {
      this.evaluate();
      return false;
    }
    if (this.validChars.includes(e.key)) {
      this.text = this.text + e.key;
      return true;
    }

  }

  addText = (t) => {
    if (this.text === "0")
      this.text = "";
    this.text = this.text + t;
    this.printTextValue();
  }

  clearText() {    
    this.text = "";
    this.printTextValue();
  }

  backspace() {
    this.text = this.text.substring(0, this.text.length - 1);
    this.printTextValue();
  }

  toggleSign() {
    if (this.text[0] == "-")
      this.text = this.text.substring(1, this.text.length);
    else
      this.text = "-" + this.text;
  }

  oneDiv() {
    this.evaluate();
    this.text = "1/(" + this.text + ")";
    this.evaluate();
  }

  sqrt() {
      this.evaluate();
      var n = parseFloat(this.text);
      this.text = Math.sqrt(n) + "";
  }

  test() {
    var tests = ["1+2", "1.5-3", "2*-4", "-10/2", "-4.5/9", "10-5*-2"];
    tests.forEach(this.tokenize, this);
  }
}
