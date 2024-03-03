import React from "react"
import Terminal from 'react-console-emulator'
import Scanner from '../compiler/scanner/token'
import ArithmeticParser from "../compiler/parser/arithmetic_parser/arithmetic_parser"
const TerminalEmulator = () => {
    const printToken = (token) => {
        return `token object: \n{
            lexeme: "${token.lexeme}",
            token: "${token.token}",
            line: "${token.line}"
        }\n
        `
    }
    const commands = {
        arithparse: {
            description: "parsing a arithmetic expression with only + and *",
            usage: "arithparse <string>",
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
        lexing: {
            desription: "lexing a passed string",
            usage: "lexing <string>",
            fn: (...args) => {
                const scanner = new Scanner(args.join(' '))
                let exe_result = ''
                while (true) {
                    const token_obj = scanner.scan()
                    if (token_obj.token !== Scanner.EOF) {
                        exe_result += printToken(token_obj)
                    } else {
                        break
                    }
                }
                return exe_result
            }
        }
    }

    return (
        <div>
            <Terminal
                commands={commands}
                welcomeMessage={'Welcome to dragon script terminal'}
                promptLabel={"me@dragon:~$"}
            >

            </Terminal>
        </div>
    )
}

export default TerminalEmulator;