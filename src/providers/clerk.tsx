import { ClerkProvider as OgClerkProvider } from "@clerk/nextjs";

const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <OgClerkProvider publishableKey="pk_test_Zm9uZC1iYWRnZXItNjUuY2xlcmsuYWNjb3VudHMuZGV2JA">
            {children}
        </OgClerkProvider>
    );
};

export { ClerkProvider };
