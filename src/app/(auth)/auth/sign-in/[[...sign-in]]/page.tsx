export const runtime = 'edge';

import { SignIn } from "@clerk/nextjs";

const SignUpPage = () => {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <SignIn signUpUrl="/auth/sign-up" />
        </div>
    );
};

export default SignUpPage;
