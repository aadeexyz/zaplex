export const runtime = "edge";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { verifyKey } from "@unkey/api";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { system } from "@/llm/prompt";
import { initDbConnection } from "@/db";
import { apiKeysTable } from "@/db/schema";
import { webSearch, coingeckoDetails, coingeckoPrice } from "@/llm/tools";

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
            experimental_activeTools: [
                "web_search",
                "coingecko_details",
                "coingecko_price",
            ],
            system: system(),
            tools: {
                web_search: webSearch,
                coingecko_details: coingeckoDetails,
                coingecko_price: coingeckoPrice,
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
