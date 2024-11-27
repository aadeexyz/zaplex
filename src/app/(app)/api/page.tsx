export const runtime = "edge";

import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { initDbConnection } from "@/db";
import { apiKeysTable } from "@/db/schema";
import { ClientAPIPage } from "./page.client";

const APIPage = async () => {
    const user = await auth();
    
    if (!user.userId) {
        return redirect("/auth");
    }
    
    const db = initDbConnection();

    const data = await db
        .select()
        .from(apiKeysTable)
    .where(eq(apiKeysTable.owner, user.userId));

    // const data = [
    //     {
    //         id: "jksdnfj",
    //         name: "Test Key",
    //         owner: "me",
    //         calls: 0,
    //     },
    //     {
    //         id: "ksjdnf",
    //         name: "Test Key",
    //         owner: "me",
    //         calls: 0,
    //     },
    //     {
    //         id: "nsdlfjk",
    //         name: "Test Key",
    //         owner: "me",
    //         calls: 0,
    //     },
    // ];

    return <ClientAPIPage keys={data} />;
};

export default APIPage;
