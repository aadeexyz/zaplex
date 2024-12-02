import { z } from "zod";

const description =
    "Search the web for information with the given query, max results and search depth.";

const parameters = z.object({
    query: z.string().describe("The search query to look up on the web."),
    maxResults: z
        .number()
        .describe(
            "The maximum number of results to return. Default to be used is 10."
        ),
    topic: z
        .enum(["general", "news", "finance"])
        .describe("The topic type to search for. Default is general."),
    searchDepth: z
        .enum(["basic", "advanced"])
        .describe("The search depth to use for the search. Default is basic."),
    excludeDomains: z
        .array(z.string())
        .describe(
            "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains."
        ),
});

const fn = async ({
    query,
    maxResults,
    topic,
    searchDepth,
    excludeDomains,
}: {
    query: string;
    maxResults: number;
    topic: "general" | "news" | "finance";
    searchDepth: "basic" | "advanced";
    excludeDomains?: string[];
}) => {
    const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: query,
            maxResults: maxResults,
            topic: topic,
            searchDepth: searchDepth,
            excludeDomains: excludeDomains,
        }),
    });

    const data = await res.json();

    const context = data.results.map(
        (result: {
            title: string;
            url: string;
            content: string;
            score: number;
            raw_content: string | null;
        }) => ({
            title: result.title,
            content: result.content,
        })
    );

    return context;
};

export { description, parameters, fn };
