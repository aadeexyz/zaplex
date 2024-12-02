import { z } from "zod";
import coinsList from "./consts/coins-list.json";

const description =
    "Get details of cryptocurrency ids by ticker or name, chains the coin is on and the address for the coin on the chain, and the currency to convert the value to supported by the CoinGecko API.";

const parameters = z.object({
    ticker: z
        .string()
        .describe(
            "The ticker of the cryptocurrency to look up. Default is None."
        ),
    name: z
        .string()
        .describe(
            "The name of the cryptocurrency to look up. Default is None."
        ),
});

const fn = async ({
    ticker,
    name,
}: {
    ticker?: string;
    name?: string;
    includePlatform?: boolean;
}) => {
    if (ticker) {
        return coinsList.filter(
            (d: {
                id: string;
                symbol: string;
                name: string;
                platforms?: Record<string, string>;
            }) => d.symbol === ticker
        );
    }

    if (name) {
        return coinsList.filter(
            (d: {
                id: string;
                symbol: string;
                name: string;
                platforms?: Record<string, string>;
            }) => d.name === name
        );
    }

    return {};
};

export { description, parameters, fn };
