export const runtime = "edge";

import { generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { verifyKey } from "@unkey/api";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { system } from "@/lib/prompt";
import { initDbConnection } from "@/db";
import { apiKeysTable } from "@/db/schema";

const POST = async (req: Request) => {
    const user = await auth();
    let usingKey = false;
    let keyId;

    const db = initDbConnection();

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

        usingKey = true;
        keyId = result.keyId;

        const keyData = await db
            .select()
            .from(apiKeysTable)
            .where(eq(apiKeysTable.id, keyId as string))
            .execute();

        if (keyData.length === 0) {
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

    try {
        const response = await generateText({
            model: model,
            maxToolRoundtrips: 3,
            experimental_activeTools: ["web_search"],
            system: system(),
            tools: {
                web_search: tool({
                    description:
                        "Search the web for information with the given query, max results and search depth.",
                    parameters: z.object({
                        query: z
                            .string()
                            .describe(
                                "The search query to look up on the web."
                            ),
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
                        const res = await fetch(
                            "https://api.tavily.com/search",
                            {
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
                            }
                        );

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
                    },
                }),
            },
            toolChoice: "auto",
            prompt: question,
        });

        if (usingKey) {
            await db
                .update(apiKeysTable)
                .set({
                    calls: sql`${apiKeysTable.calls} + 1`,
                })
                .where(eq(apiKeysTable.id, keyId as string))
                .execute();
        }

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
    } catch {
        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
};

export { POST };
