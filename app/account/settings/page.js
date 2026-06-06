"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("password");

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Email form
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [emailError, setEmailError] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);

    useEffect(() => {
        async function getUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login?redirect=/account/settings");
                return;
            }
            setUser(user);
            setLoading(false);
        }
        getUser();
    }, [router]);

    async function handlePasswordChange(e) {
        e.preventDefault();
        setPasswordMessage("");
        setPasswordError("");

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await fetch("/api/account/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPasswordError(data.error || "Failed to update password.");
            } else {
                setPasswordMessage(data.message);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setPasswordLoading(false);
        }
    }

    async function handleEmailChange(e) {
        e.preventDefault();
        setEmailMessage("");
        setEmailError("");

        if (!newEmail || !emailPassword) {
            setEmailError("Please fill in all fields.");
            return;
        }

        setEmailLoading(true);
        try {
            const res = await fetch("/api/account/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail, currentPassword: emailPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setEmailError(data.error || "Failed to update email.");
            } else {
                setEmailMessage(data.message);
                setNewEmail("");
                setEmailPassword("");
            }
        } catch (err) {
            setEmailError(err.message);
        } finally {
            setEmailLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="text-slate-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12">
            <h1 className="text-2xl font-bold text-[#2D3436]">Account Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
                Signed in as <span className="font-medium text-slate-700">{user?.email}</span>
            </p>

            <div className="mt-8 border-b border-slate-200">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setActiveTab("password")}
                        className={`pb-3 text-sm font-medium transition-colors ${
                            activeTab === "password"
                                ? "border-b-2 border-[#00BFA5] text-[#00BFA5]"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Change Password
                    </button>
                    <button
                        onClick={() => setActiveTab("email")}
                        className={`pb-3 text-sm font-medium transition-colors ${
                            activeTab === "email"
                                ? "border-b-2 border-[#00BFA5] text-[#00BFA5]"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Change Email
                    </button>
                </nav>
            </div>

            {activeTab === "password" && (
                <form onSubmit={handlePasswordChange} className="mt-8 space-y-5">
                    {passwordMessage && (
                        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {passwordMessage}
                        </div>
                    )}
                    {passwordError && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {passwordError}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Current Password</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]"
                        />
                        <p className="mt-1 text-xs text-slate-500">Minimum 8 characters.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="inline-flex items-center justify-center rounded-lg bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a88f] disabled:opacity-50"
                    >
                        {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            )}

            {activeTab === "email" && (
                <form onSubmit={handleEmailChange} className="mt-8 space-y-5">
                    {emailMessage && (
                        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {emailMessage}
                        </div>
                    )}
                    {emailError && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {emailError}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Current Email</label>
                        <input
                            type="email"
                            disabled
                            value={user?.email || ""}
                            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">New Email Address</label>
                        <input
                            type="email"
                            required
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Current Password (for verification)</label>
                        <input
                            type="password"
                            required
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={emailLoading}
                        className="inline-flex items-center justify-center rounded-lg bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a88f] disabled:opacity-50"
                    >
                        {emailLoading ? "Sending confirmation..." : "Change Email"}
                    </button>
                    <p className="text-xs text-slate-500">
                        A confirmation email will be sent to your new address. You must click the link in that email to complete the change.
                    </p>
                </form>
            )}
        </div>
    );
}
