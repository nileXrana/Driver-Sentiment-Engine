"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "../../lib/ApiClient";
import Link from "next/link";
import { LoginPayload } from "../../types";

export default function LoginPage() {
    const router = useRouter();

    // Standard form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Reusable login execution logic
    const executeLogin = async (payload: LoginPayload) => {
        setError("");
        setIsLoading(true);

        try {
            const result = await ApiClient.login(payload);

            // Store token (in a real app this would go to HttpOnly cookies or a robust state manager)
            localStorage.setItem("authToken", result.token);
            localStorage.setItem("authRole", result.role);

            // Role-based redirection
            if (result.role === "ADMIN") {
                router.push("/dashboard"); // Assuming the admin dashboard maps here
            } else {
                router.push("/feedback");  // Employees go to the feedback submission form
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed. Please check credentials.");
            setIsLoading(false);
        }
    };

    const handleStandardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        executeLogin({ email, password });
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50/50 relative overflow-hidden">

            {/* Background aesthetics */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-sm text-gray-500">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleStandardSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition text-sm"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Password
                                </label>
                                <Link href="#" className="text-xs font-medium text-gray-600 hover:text-gray-900">
                                    Forgot?
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition text-sm"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 flex justify-center items-center"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Sign In"}
                        </button>
                    </form>

                    {/* ─── Zero-Config Demo Section ─── */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center mb-4">
                            For Demo Purpose:
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail("admin@moveinsync.com");
                                    setPassword("admin123");
                                }}
                                disabled={isLoading}
                                className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition text-center group disabled:opacity-50"
                            >
                                <div className="text-xs font-bold text-gray-900 mb-1">Login as Admin</div>
                                <div className="text-[10px] text-gray-500 font-mono bg-white inline-block px-1.5 py-0.5 rounded border border-gray-100">admin@</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setEmail("emp@moveinsync.com");
                                    setPassword("emp123");
                                }}
                                disabled={isLoading}
                                className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition text-center group disabled:opacity-50"
                            >
                                <div className="text-xs font-bold text-gray-900 mb-1">Login as Employee</div>
                                <div className="text-[10px] text-gray-500 font-mono bg-white inline-block px-1.5 py-0.5 rounded border border-gray-100">emp@</div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
