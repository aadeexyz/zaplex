import { z } from "zod";
import { baseUrl } from "./utils";
import _supportedVsCurrencies from "./consts/supported-vs.json";

const toTuple = (arr: string[]): [string, ...string[]] => {
    if (!arr || arr.length === 0) {
        throw new Error("supportedVsCurrencies must have at least one element");
    }
    return arr as [string, ...string[]];
};

const supportedVsCurrencies = toTuple(_supportedVsCurrencies);

const description =
    "Get the price of a token with the given id and vs currency from CoinGecko";

const parameters = z.object({
    id: z.string().describe("The id of the token to get the price for."),
    vsCurrency: z
        .enum(supportedVsCurrencies)
        .describe(
            "The currency to get the price of the token in. Default is USD."
        ),
});

const fn = async ({
    id,
    vsCurrency,
}: {
    id: string;
    vsCurrency: (typeof supportedVsCurrencies)[number];
}) => {
    const endpoint = "/simple/price";
    const url = `${baseUrl}${endpoint}?ids=${id.toLowerCase()}&vs_currencies=${vsCurrency.toLowerCase()}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
                "x-cg-demo-api-key": process.env.COINGECKO_API_KEY as string,
            },
        });

        if (!res.ok) {
            return {
                error: "Failed to fetch data from CoinGecko",
            };
        }

        const data = await res.json();

        return data;
    } catch {
        return {
            error: "Failed to fetch data from CoinGecko",
        };
    }
};

export { description, parameters, fn };
