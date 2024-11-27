export const runtime = "edge";

import { Unkey } from "@unkey/api";
import { auth } from "@clerk/nextjs/server";
import { initDbConnection } from "@/db";
import { apiKeysTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const DELETE = async (
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const user = await auth();

    if (!user.userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const db = initDbConnection();
    const { id } = await params;

    const key = await db
        .select()
        .from(apiKeysTable)
        .where(eq(apiKeysTable.id, id))
        .execute();

    if (key.length === 0) {
        return new Response("API key not found", { status: 404 });
    }

    if (key[0].owner !== user.userId) {
        return new Response("Forbidden", { status: 403 });
    }

    const unkey = new Unkey({ rootKey: process.env.UNKEY_ROOT_KEY as string });

    const unkeyDeletePromise = unkey.keys.delete({ keyId: id });
    const dbDeletePromise = db
        .delete(apiKeysTable)
        .where(eq(apiKeysTable.id, id))
        .returning()
        .execute();

    const [unkeyDeleteResult, deletedKey] = await Promise.all([
        unkeyDeletePromise,
        dbDeletePromise,
    ]);

    if (!unkeyDeleteResult || unkeyDeleteResult.error) {
        return new Response("Failed to delete API key from Unkey", {
            status: 500,
        });
    }

    if (deletedKey.length === 0) {
        return new Response("Failed to delete API key from database", {
            status: 500,
        });
    }

    return new Response(JSON.stringify(deletedKey[0]), { status: 200 });
};

export { DELETE };
