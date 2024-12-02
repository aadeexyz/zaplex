import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers";
import "./globals.css";

export const metadata: Metadata = {
    title: "Zaplex",
    description: "Answers in a Zap",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(GeistSans.className, "antialiased")}>
                <Providers>
                    <SignedOut>
                        <main className="flex flex-col w-full">{children}</main>
                    </SignedOut>

                    <SignedIn>
                        <AppSidebar />
                        <main className="flex flex-col w-full">
                            <SidebarTrigger />
                            {children}
                        </main>
                    </SignedIn>
                </Providers>
            </body>
        </html>
    );
}
