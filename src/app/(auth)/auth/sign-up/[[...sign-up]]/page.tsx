export const runtime = 'edge';

import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <SignUp signInUrl="/auth/sign-in" />
        </div>
    );
};

export default SignUpPage;
