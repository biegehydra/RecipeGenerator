import AuthForm from '@/app/components/AuthForm';

export default function SignupPage() {
    return (
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div>
                <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create an Account
                </h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign up to start using Ingredient Imposter
                </p>
            </div>
            <AuthForm mode="signup" />
        </div>
    );
} 