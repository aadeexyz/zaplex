export const runtime = 'edge';

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
    const { userId } = await auth();

    if (!userId) {
        redirect("/auth");
    }

    return children;
};

export default AppLayout;
