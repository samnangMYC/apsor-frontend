import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LockKeyhole } from "lucide-react";

const AdminUnauthPage = () => {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-app px-4 py-10 text-text-primary">
            <div className="absolute inset-0">
                <div className="absolute left-[-80px] top-[-80px] h-72 w-72 rounded-full bg-p-500/10 blur-3xl" />
                <div className="absolute bottom-[-100px] right-[-60px] h-80 w-80 rounded-full bg-p-700/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.08),transparent_40%)]" />
            </div>

            <div className="relative z-10 w-full max-w-xl">
                <div className="rounded-xl border border-border bg-bg-surface/95 p-8 shadow-3 backdrop-blur-sm md:p-10">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft shadow-1">
                        <ShieldAlert className="h-8 w-8 text-brand" />
                    </div>

                    <div className="text-center">
                        <div className="mb-3 inline-flex items-center rounded-pill border border-border bg-bg-subtle px-3 py-1 text-sm font-medium text-text-secondary">
                            <LockKeyhole className="mr-2 h-4 w-4" />
                            Admin Access Restricted
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                            Unauthorized Access
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-text-secondary md:text-base">
                            Your session is invalid, expired, or you do not have permission to
                            access the admin dashboard.
                        </p>
                    </div>

                    <div className="mt-8 rounded-lg border border-border bg-bg-subtle p-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-danger" />
                            <div>
                                <p className="text-sm font-medium text-text-primary">
                                    Access denied
                                </p>
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    Please sign in again with an authorized admin account to continue.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            to="/signin"
                            className="inline-flex h-lg flex-1 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-1 transition-all duration-base ease-smooth hover:bg-brand-hover active:bg-brand-pressed"
                        >
                            Go to Sign In
                        </Link>

                        <Link
                            to="/"
                            className="inline-flex h-lg flex-1 items-center justify-center rounded-lg border border-border bg-bg-surface px-5 text-sm font-semibold text-text-primary transition-all duration-base ease-smooth hover:bg-bg-subtle"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>

                    <div className="mt-6 border-t border-border pt-4 text-center">
                        <p className="text-xs leading-5 text-text-muted">
                            Error code: <span className="font-medium text-danger">401 / UNAUTHORIZED</span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AdminUnauthPage;