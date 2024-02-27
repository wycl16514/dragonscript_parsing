We left three problems for the arithmetic expression parser, the first one is there is a bug when we don't have space between number and operator such as "arithparse 1+2;", the root cause it is
in scanner, when we scan number, if we encounter any character that are not allowd in the function isEndOfToken, scanner will emit a error token. The fix is that we immediately return what we
have scanned when we first encounter any character that is not digit, therefore we change the number scanning code like following:
```js
scan = ()=> {
 while (this.current < this.source.length) {
    const c = this.source[this.current]
    switch (c) {
    ...
    if (this.isDigit(this.peek())) {
                        char = ""
                        while (this.isDigit(this.peek())) {
                            char += this.peek()
                            this.current += 1
                        }
                        //consume the decimal point
                        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
                            char += "."
                            this.current += 1
                        } else {
                            //return what we got when first have no digit char
                            return this.makeToken(char, Scanner.NUMBER, this.line)
                        }

                        while (this.isDigit(this.peek())) {
                            char += this.peek()
                            this.current += 1
                        }

                        //return when we have no-digit character
                        return this.makeToken(char, Scanner.NUMBER, this.line)
                    }
        ....
    }
 }
```
After the fix we can handle expression that are no spaces bewteen numbers:
<img width="1440" alt="截屏2024-02-27 17 18 21" src="https://github.com/wycl16514/dragonscript_parsing/assets/7506958/747e61f6-971b-49aa-8401-c605f076ee18">

The fix will cause 2 test cases fail and remember to remove them:
```js
// it("should return error token for string start with number and \
    // follow with characters that are not digit", () => {
    //     let scanner = new Scanner("123_abc")
    //     let error_token = scanner.scan()
    //     expect(error_token).toMatchObject({
    //         lexeme: "illegal char in number string:_",
    //         token: Scanner.ERROR,
    //         line: 0,
    //     })
    // })

 // it("should return error token for number string with trailing decimal", () => {
    //     let scanner = new Scanner("1234.")
    //     let error_token = scanner.scan()
    //     expect(error_token).toMatchObject({
    //         lexeme: "trailing decimal number string",
    //         token: Scanner.ERROR,
    //         line: 0,
    //     })
    // })
```

The second problem is how we handle multiple expressions, such as "arithparse 1+2; 3*4;", noticed we use SEMICOLON the indicate the end of expression, and we can split the input to several
expression by using the semicolon, and we add code like following:
```js
stmt = () => {
        /*
        an semicolon indicate a end of expression, we iterate the tokens array,
        if we found one semicolon, then we take out tokens we collect now and
        send them to parse
        */

        //stmt -> expr SEMI
        let res = ""
        let tokens = []
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].token !== Scanner.SEMICOLON) {
                tokens.push(this.tokens[i])
            } else {
                //send them to parse
                res += this.expr(tokens)
                this.matchToken(Scanner.SEMICOLON)
                tokens = []
                res += ";"
            }
        }


        return res
    }
```
After the above code, we can handle multiple expression at once:
<img width="532" alt="截屏2024-02-27 18 01 15" src="https://github.com/wycl16514/dragonscript_parsing/assets/7506958/4d1de12c-f33f-432a-a1a8-b0198ec587e7">

For the last question, if we change the order of PLUS loop with START loop, the priority of "+" will over "*" which means "1+2*3" will have the same result of "(1+2)*3"
