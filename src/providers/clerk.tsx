import { ClerkProvider as OgClerkProvider } from "@clerk/nextjs";

const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
    return <OgClerkProvider>{children}</OgClerkProvider>;
};

export { ClerkProvider };
