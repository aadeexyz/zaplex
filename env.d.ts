import type { D1Database } from "@cloudflare/workers-types";

declare global {
    interface CloudflareEnv {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
        CLERK_SECRET_KEY: string;
        OPENAI_API_KEY: string;
        OPENAI_BASE_URL: string;
        UNKEY_ROOT_KEY: string;
        UNKEY_API_ID: string;
        TAVILY_API_KEY: string;
        DB: D1Database;
    }
}
