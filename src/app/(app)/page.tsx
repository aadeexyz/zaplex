export const runtime = "edge";

import { redirect } from "next/navigation";

const Page = () => {
    redirect("/search");
};

export default Page;
