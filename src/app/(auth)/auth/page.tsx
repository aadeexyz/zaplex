export const runtime = "edge";

import { redirect } from "next/navigation";

const Page = () => {
    redirect("/auth/sign-up");
};

export default Page;
