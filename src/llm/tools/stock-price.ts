import { z } from "zod";

const description =
    "Get the price of a stock with the given symbol from TweleveData";

const parameters = z.object({
    symbol: z
        .string()
        .describe("The symbol of the stock to get the price for."),
});

const fn = async ({ symbol }: { symbol: string }) => {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${process.env.TWELVEDATA_API_KEY}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!res.ok) {
            return {
                error: "Failed to fetch data from TweleveData",
            };
        }

        const data = await res.json();

        return data;
    } catch {
        return {
            error: "Failed to fetch data from TweleveData",
        };
    }
};

export { description, parameters, fn };
