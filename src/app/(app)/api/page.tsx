export const runtime = "edge";

import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { initDbConnection } from "@/db";
import { apiKeysTable } from "@/db/schema";
import { ClientAPIPage } from "./page.client";

const APIPage = async () => {
    const user = await auth();
    const db = initDbConnection();

    if (!user.userId) {
        return redirect("/auth");
    }

    const data = await db
        .select()
        .from(apiKeysTable)
        .where(eq(apiKeysTable.owner, user.userId));

    return <ClientAPIPage keys={data} />;
};

export default APIPage;
