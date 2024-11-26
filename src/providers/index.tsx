import { ThemeProvider } from "./theme";
import { ReactQueryProvider } from "./react-query";
import { ClerkProvider } from "./clerk";
import { SidebarProvider } from "@/components/ui/sidebar";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
                <SidebarProvider>
                    <ClerkProvider>{children}</ClerkProvider>
                </SidebarProvider>
            </ThemeProvider>
        </ReactQueryProvider>
    );
};

export { Providers };
