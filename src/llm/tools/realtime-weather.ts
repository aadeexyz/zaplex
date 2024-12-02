import { z } from "zod";

const description = "Get the current weather for a given location and units.";

const parameters = z.object({
    location: z.string().describe("The location to get the weather for."),
    units: z
        .enum(["metric", "imperial"])
        .default("metric")
        .describe("The units to get the weather in. Default is metric."),
});

const fn = async ({
    location,
    units,
}: {
    location: string;
    units: "metric" | "imperial";
}) => {
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${location.toLowerCase()}&units=${units}&apikey=${
        process.env.TOMORROW_IO_API_KEY
    }`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!res.ok) {
            return {
                error: "Failed to fetch data from Tomorrow.io",
            };
        }

        const data = await res.json();

        return data;
    } catch {
        return {
            error: "Failed to fetch data from Tomorrow.io",
        };
    }
};

export { description, parameters, fn };
