export const runtime = "edge";

import { auth } from "@clerk/nextjs/server";
import { Unkey } from "@unkey/api";
import { initDbConnection } from "@/db";
import { apiKeysTable } from "@/db/schema";

const POST = async (req: Request) => {
    const user = await auth();

    if (!user.userId) {
        return new Response(
            JSON.stringify({
                error: "Please sign in to generate a key.",
            }),
            {
                status: 401,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    const body = await req.json();
    const name = body.name;

    if (!name) {
        return new Response(
            JSON.stringify({
                error: "Please provide a name for the key.",
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    const unkey = new Unkey({ rootKey: process.env.UNKEY_ROOT_KEY as string });

    const created = await unkey.keys.create({
        apiId: process.env.UNKEY_API_ID as string,
        prefix: "zaplex",
        byteLength: 32,
        externalId: user.userId,
        name: name,
    });

    if (!created || created.error) {
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

    const db = initDbConnection();
    await db
        .insert(apiKeysTable)
        .values({
            id: created.result.keyId,
            name: name,
            owner: user.userId,
        })
        .returning({
            insertedId: apiKeysTable.id,
        })
        .get()
        .catch(() => {
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
        });

    return new Response(
        JSON.stringify({
            key: created.result.key,
            id: created.result.keyId,
            name: name,
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
