In this section we will use code to design an arithmetic parser, its input is a line for arithmetic expression, the expression can only contains numbers, and operator "+", "*", for example the input can be like this:
1 + 2*3 + 4;
the parser parsing the input and will compute the result for the expression, for example the parser will give following output for the input:
5;

Let's create a new forlder: /src/parser/arithmetic_parser/, and create a new file named arithmetic_parser.js, let's add some code for the file:
```js
import Scanner from '../../scanner/token'
export default class ArithmeticParser {
    constructor(expr) {
        this.expr = expr
        this.scanner = new Scanner(expr);
        //save all tokens for given expression
        this.tokens = []
    }

    getExprTokens = () => {
        //get tokens util we meet SEMICOLON
        while (true) {
            const token_obj = this.scanner.scan()
            if (token_obj.token !== Scanner.EOF) {
                this.tokens.push(token_obj)
            } else {
                break
            }
        }

        //need to make sure expression end with semicolon
        const last_token = this.tokens[this.tokens.length - 1];
        if (last_token.token !== Scanner.SEMICOLON) {
            throw new Error("Expression not end with semicolon")
        }
    }
}
```

In above code, we will use the expression string to init an instance of ArithmeticParser object, in the constructor, it uses Scanner to scan the input and get tokens for the input expression, we need to make sure the expression has semicolon as its end, otherwise we will throw a error.

