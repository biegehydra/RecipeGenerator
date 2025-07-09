'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
    mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [verificationSent, setVerificationSent] = useState(false);

    const handleGoogleSignIn = async () => {
        setStatus('loading');
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/smart-swap');
        } catch (err: any) {
            console.error('Google Sign-in Error:', err);
            setError(err.message || 'Google sign-in failed');
        } finally {
            setStatus('idle');
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationError(null);
        setStatus('loading');

        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                router.push('/smart-swap');
            } else {
                if (password !== confirmPassword) {
                    setValidationError('Passwords do not match');
                    setStatus('idle');
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCredential.user);
                setVerificationSent(true);
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setValidationError('This email is already registered.');
            } else if (err.code === 'auth/invalid-email') {
                setValidationError('Invalid email address.');
            } else if (err.code === 'auth/weak-password') {
                setValidationError('Password is too weak. Must be at least 6 characters.');
            } else {
                setError(err.message || 'Authentication error');
            }
        } finally {
            setStatus('idle');
        }
    };

    if (verificationSent) {
        return (
            <div className="max-w-md mx-auto p-6 space-y-4 text-center">
                <h2 className="text-xl font-semibold">Verification Email Sent!</h2>
                <p className="text-sm text-gray-600">
                    A verification link has been sent to <strong>{email}</strong>. Please check your inbox.
                </p>
                <Link href="/login" className="text-indigo-600 hover:underline text-sm">
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-6">
            <button
                onClick={handleGoogleSignIn}
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                {status === 'loading' ? 'Processing...' : 'Continue with Google'}
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full rounded border px-3 py-2 shadow-sm"
                            required
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded border px-3 py-2 shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded border px-3 py-2 shadow-sm"
                        required
                        minLength={6}
                    />
                </div>

                {mode === 'signup' && (
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full rounded border px-3 py-2 shadow-sm"
                            required
                        />
                    </div>
                )}

                {mode === 'login' && (
                    <div className="text-sm text-right">
                        <Link href="/forgot-password" className="text-indigo-600 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                )}

                {validationError && (
                    <p className="text-sm text-red-600">{validationError}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="text-center text-sm">
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-600 hover:underline">Sign in</Link>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
