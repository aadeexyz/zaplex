export const runtime = "edge";

import { generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { verifyKey } from "@unkey/api";
import { tavily } from "@tavily/core";
import { auth } from "@clerk/nextjs/server";
import { system } from "@/lib/prompt";

const POST = async (req: Request) => {
    const user = await auth();

    if (!user.userId) {
        const authHeader = req.headers.get("Authorization");

        if (!authHeader) {
            return new Response(
                JSON.stringify({
                    error: "Unauthorized",
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        if (!authHeader.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({
                    error: "Unauthorized",
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const key = authHeader.replace("Bearer ", "");

        const { result, error } = await verifyKey({
            apiId: process.env.UNKEY_API_ID as string,
            key: key,
        });

        if (error) {
            return new Response(
                JSON.stringify({
                    error: "Internal Server Error",
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        if (!result.valid) {
            return new Response(
                JSON.stringify({
                    error: "Unauthorized",
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
    }

    const body = await req.json();
    const question = body.question;

    if (!question) {
        return new Response(
            JSON.stringify({
                error: "Question is required",
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
    });

    const model = openai.chat("gpt-4o-mini");

    const response = await generateText({
        model: model,
        maxToolRoundtrips: 3,
        experimental_activeTools: ["web_search"],
        system: system,
        tools: {
            web_search: tool({
                description:
                    "Search the web for information with the given query, max results and search depth.",
                parameters: z.object({
                    query: z
                        .string()
                        .describe("The search query to look up on the web."),
                    maxResults: z
                        .number()
                        .describe(
                            "The maximum number of results to return. Default to be used is 10."
                        ),
                    topic: z
                        .enum(["general", "news", "finance"])
                        .describe(
                            "The topic type to search for. Default is general."
                        ),
                    searchDepth: z
                        .enum(["basic", "advanced"])
                        .describe(
                            "The search depth to use for the search. Default is basic."
                        ),
                    excludeDomains: z
                        .array(z.string())
                        .describe(
                            "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains."
                        ),
                }),
                execute: async ({
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
                    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

                    const data = await tvly.search(query, {
                        topic: topic,
                        maxResults: maxResults,
                        searchDepth: searchDepth,
                        excludeDomains: excludeDomains,
                    });

                    const context = data.results.map((result) => ({
                        title: result.title,
                        content: result.content,
                    }));

                    return context;
                },
            }),
        },
        toolChoice: "auto",
        prompt: question,
    });

    return new Response(
        JSON.stringify({
            answer: response.text,
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};

export { POST };
