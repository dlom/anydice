import * as request from "request";

import { AnyDiceError, prettify } from "./error";
import { random } from "./Util";

export type AnyDiceDistribution = [number, number][];

interface AnyDiceDistributions {
    data: AnyDiceDistribution[],
    labels: string[],
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
}

export interface AnyDiceResponse {
    distributions?: AnyDiceDistributions,
    error?: AnyDiceError
}

const anyDiceRequest = (program: string, endpoint: string): Promise<any> => {
    const api = "http://anydice.com";
    const promise = new Promise<any>((resolve, reject) => {
        request.post(`${api}${endpoint}`, {
            form: { program },
            json: true
        }, (err, response, body) => {
            if (err) return reject(err);
            resolve(body);
        });
    });
    return promise;
}

export class AnyDice {
    private results: Map<string, AnyDiceDistribution>;

    private constructor(private expression: string, private link: string, distributions: AnyDiceDistributions) {
        this.results = new Map();
        distributions.labels.forEach((label, index) => {
            this.results.set(label, distributions.data[index]);
        });
    }

    public first(): string {
        return Array.from(this.results.keys())[0];
    }

    public default(): string {
        return this.first();
    }

    public get(name: string): AnyDiceDistribution {
        const distribution = this.results.get(name);
        if (distribution == undefined) {
            return [];
        }
        return distribution;
    }

    public roll(name: string): number[];
    public roll(name: string, times: number): number[];
    public roll(name: string, times?: number): number[] {
        if (times == null) {
            times = 1;
        }
        const distribution = this.get(name);
        const rolls: number[] = [];
        for (let r = 0; r < times; r++) {
            const roll = random() * 100;
            let odds = 0;
            for (let i = 0; i < distribution.length; i++) {
                odds += distribution[i][1];
                if (odds >= roll) {
                    rolls.push(distribution[i][0]);
                    break;
                }
            }
        }
        return rolls;
    }

    public possibleValues(name: string): number[] {
        return this.get(name).map((value) => {
            return value[0];
        });
    }

    public max(name: string): number {
        const max = this.possibleValues(name).slice(-1)[0];
        return (max == null) ? 0 : max;
    }

    public min(name: string): number {
        const min = this.possibleValues(name).slice(0, 1)[0];
        return (min == null) ? 0 : min;
    }

    public analyze(): string {
        return this.link;
    }

    public static async analyze(expression: string): Promise<string> {
        const response = await anyDiceRequest(expression, "/createLink.php");
        return response as string;
    }

    public static async raw(expression: string): Promise<AnyDiceResponse> {
        const response = await anyDiceRequest(expression, "/calculator_limited.php");
        return response as AnyDiceResponse;
    }

    public static async run(expression: string): Promise<AnyDice>;
    public static async run(expression: string, pretty: boolean): Promise<AnyDice>;
    public static async run(expression: string, pretty?: boolean): Promise<AnyDice> {
        if (pretty == null) pretty = false;
        const response = await AnyDice.raw(expression);
        if (response.error != null) {
            response.error.message = response.error.message.replace("<br>", " ");
            if (pretty) {
                throw new Error(prettify(response.error, expression));
            } else {
                throw new Error(response.error.message);
            }
        } else if (response.distributions != null) {
            const link = await AnyDice.analyze(expression);
            return new AnyDice(expression, link, response.distributions);
        } else {
            throw new Error("Bad response from AnyDice");
        }
    }
}
