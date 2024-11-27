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
        return {
            status: 401,
            body: {
                message: "Unauthorized",
            },
        };
    }

    const db = initDbConnection();
    const { id } = await params;

    const key = await db
        .select()
        .from(apiKeysTable)
        .where(eq(apiKeysTable.id, id))
        .execute();

    if (key.length === 0) {
        return {
            status: 404,
            body: {
                message: "API key not found",
            },
        };
    }

    if (key[0].owner !== user.userId) {
        return {
            status: 403,
            body: {
                message: "Forbidden",
            },
        };
    }

    const unkey = new Unkey({ rootKey: process.env.UNKEY_ROOT_KEY as string });

    const deleted = await unkey.keys.delete({ keyId: id });

    if (!deleted || deleted.error) {
        return {
            status: 500,
            body: {
                message: "Failed to delete API key",
            },
        };
    }

    const deletedKey = await db
        .delete(apiKeysTable)
        .where(eq(apiKeysTable.id, id))
        .returning()
        .execute();

    if (deletedKey.length === 0) {
        return {
            status: 500,
            body: {
                message: "Failed to delete API key",
            },
        };
    }

    return {
        status: 200,
        body: deletedKey[0],
    };
};

export { DELETE };
