import * as chalk from "chalk";

export interface AnyDiceError {
    message: string,
    type: string,
    index?: number,
    token?: string
}

const indexToRowAndCol = (lines: string[], index: number): [number, number] => {
    let row = 0;
    let col = index;
    for (const line of lines) {
        if (col > line.length) {
            col -= (line.length + 1); // newline too
            row += 1;
        } else {
            break;
        }
    }
    return [row, col];
}

const createIndicator = (offset: number, length: number): string => {
    const space = ' ';
    const carat = '^';
    const tilde = '~';

    return `${space.repeat(offset)}${carat}${tilde.repeat(length - 1)}`;
}

export const prettify = (error: AnyDiceError, code: string): string => {
    if (error.index != null && error.token != null) {
        const token = (error.token === " end of input ") ? " " : error.token;
        const start = error.index - token.length;
        const lines = code.split("\n");
        let [row, col] = indexToRowAndCol(lines, start);
        const line = lines[row];

        const top = chalk.bold(`${row}:${col}: ${chalk.red(`${error.type}:`)} ${error.message})`);
        const middle = `${line}`;
        const bottom = chalk.bold.green(`${createIndicator(col, token.length)}`);

        return `${top}\n${middle}\n${bottom}`;
    } else {
        return chalk.bold(`${chalk.red(`${error.type}:`)} ${error.message})`);
    }
}
