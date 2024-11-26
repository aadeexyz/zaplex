export const runtime = "edge";

import { drizzle } from "drizzle-orm/d1";
import { getRequestContext } from "@cloudflare/next-on-pages";

const initDbConnection = () => {
    const { env } = getRequestContext();

    return drizzle(env.DB);
};

export { initDbConnection };
