In this section we will use code to design an arithmetic parser, its input is a line for arithmetic expression, the expression can only contains numbers, and operator "+", "*", for example the input can be like this:
1 + 2*3 + 4;
the parser parsing the input and will compute the result for the expression, for example the parser will give following output for the input:
5;

Let's create a new forlder: /src/parser/arithmetic_parser/, and create a new file named arithmetic_parser.js, let's add some code for the file:
```js
import Scanner from '../../scanner/token'
export default class ArithmeticParser {
   constructor(expression) {
        this.expression = expression
        //this scanner is used to get all tokens at once
        this.init_scanner = new Scanner(expression);
        this.scanner = new Scanner(expression);
        //save all tokens for given expression
        this.tokens = []
        this.getExprTokens()
    }

    getExprTokens = () => {
        while (true) {
            const token_obj = this.init_scanner.scan()
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

How can we use the rule to check the the list of token is legal or not? Actually a rule can turn into function call, non-terminator in the rule is a function call and terminator in the rule is a token match, for example the rule:
stmt -> expr SEMI
turn into code would be like this:
```js
stmt() {
    expr()
    matchToken(Scan.SEMI)
}
```
and the rule expr -> expr PLUS expr turn into code would like this:
```js
expr ()
{
    expr()
    matchToken(Scan.PLUS)
    expr()
}
```
could you notice the problem above? It's a recursive call that is expr calling itself, this would cause the running out of local stack, we will find ways to handle it, let' begin our parsing process, first we will add a function named parse, and it will implement the rule: stmt -> expr SEMI, the code is like this:
```js
matchToken = (token)=>{
        //check the given token can match the current token or not
        const cur_token = this.scanner.scan()
        if (cur_token.token !== token) {
            throw new Error(`token mismatch, expected: ${token}, got: ${cur_token.token}`)
        }
        return cur_token
    }

    parse = ()=> {
        //execute the first rule
        return this.stmt()
    }

    stmt = ()=> {
        //stmt -> expr SEMI
        const res = this.expr(this.tokens.slice(0, this.tokens.length - 1))
        this.matchToken(Scanner.SEMICOLON)
        return res 
    }

```
Implement expr is a little tricky, because there are three rules begin wit expr, they are:
expr -> NUM
expr -> expr PLUS expr
expr -> expr MUL expr
which one we should use? The algrithm for expr would like following:
1, if the input tokens has only one element, then choose expr -> NUM
2, if the input tokens has more than one element, iterate over the input tokens, if there are PLUS terminator in it, use expr -> expr PLUS expr
3, if the input tokens has more than one element, iterate over the input tokens, if there are MUL terminator in in it, use expr -> expr MUL expr
4, throw error if none of above happened
and the code for expr would be like this:
```js
expr = (tokens) => {
        /*
        1, if the input tokens has only one element, then choose expr -> NUM
        2, if the input tokens has more than one element, iterate over the input tokens, if there are PLUS terminator in it, use expr -> expr PLUS expr
        3, if the input tokens has more than one element, iterate over the input tokens, if there are MUL terminator in in it, use expr -> expr MUL expr
        4, throw error if none of above happened
        */
        if (tokens.length === 1) {
            //expr -> NUM
            const token_obj = this.matchToken(Scanner.NUMBER);
            return parseInt(token_obj.lexeme)
        }

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].token === Scanner.PLUS) {
                //expr -> expr PLUS expr
                const left = this.expr(tokens.slice(0, i))
                this.matchToken(Scanner.PLUS)
                const right = this.expr(tokens.slice(i + 1, tokens.length))
                return left + right
            }
        }

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].token === Scanner.START) {
                //expr -> expr MUL expr
                const left = this.expr(tokens.slice(0, i))
                this.matchToken(Scanner.START)
                const right = this.expr(tokens.slice(i + 1, tokens.length))
                return left * right
            }
        }

        //error here
        throw new Error("error for input expression")
    }
```
Now we complete the arithmetic parser, and we import this component into terminal like this, in terminal.jsx we add following code:
```js
import ArithmeticParser from '../../compiler/parser/arithmetic_parser/arithmetic_parser'

const TerminalEmulator = () => {
...
  const commands = {
        arithparse: {
            description: 'parsing a arithmetic expression with only + and *.',
            usage: 'arithparse <string>',
            fn: (...args) => {
                const parser = new ArithmeticParser(args.join(' '))
                let res = ''
                try {
                    res = parser.parse()
                }
                catch (err) {
                    res = err.message
                }
                return res
            }
        },
    ...
}
...
}
```
then we can use the arithparse command like following:

<img width="489" alt="截屏2024-02-27 13 25 46" src="https://github.com/wycl16514/dragonscript_parsing/assets/7506958/48b535db-c232-4e3f-8cc3-6d9b461c22af">

There are some problems we need to handle:
1, we add spaces in the expression "1 + 2;" , what will happen if we remove the spaces, for example "arithparse 1+2;"
2, we havn't used the SEMICOLON yet, what if we want to handle multiple expression at once , for example "arithparse 1 + 2; 1 * 2;"
3, we would happend if we change the order of  for loop for PLUS and START

