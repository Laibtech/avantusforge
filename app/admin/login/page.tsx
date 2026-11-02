"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, User, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials provided.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F7] flex items-center justify-center p-4 sm:p-6 text-[#24151B]">
      <div className="w-full max-w-md bg-white border border-[#EADFE3] rounded-2xl shadow-[0_20px_50px_rgba(36,21,27,0.08)] overflow-hidden">
        {/* Brand Header */}
        <div className="bg-[#4A0B20] p-8 text-center text-[#FAF7F7] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-white/10 to-transparent pointer-events-none rounded-full -mr-16 -mt-16" />

          <div className="relative z-1 flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="AvantusForge"
              width={180}
              height={48}
              className="h-8 w-auto object-contain brightness-0 invert !rounded-none mb-3"
              style={{ borderRadius: 0 }}
              priority
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-[10px] font-mono font-bold tracking-widest text-[#D6A45B] uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrative Portal</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight mt-3 text-white">
              Super Admin Authorization
            </h1>
            <p className="text-xs text-white/70 mt-1 max-w-xs leading-relaxed">
              Secure access for verified operations directors and technical administrators.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-8 sm:p-9 space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#24151B] uppercase tracking-wider block">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777078]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@avantusforge.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EADFE3] text-sm text-[#24151B] bg-[#FAF7F7] focus:bg-white focus:outline-none focus:border-[#74102E] focus:ring-1 focus:ring-[#74102E] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#24151B] uppercase tracking-wider block">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777078]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#EADFE3] text-sm text-[#24151B] bg-[#FAF7F7] focus:bg-white focus:outline-none focus:border-[#74102E] focus:ring-1 focus:ring-[#74102E] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777078] hover:text-[#24151B] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#74102E] hover:bg-[#4A0B20] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Verifying Credentials..." : "Authorize Access"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-[#EADFE3]/60">
            <span className="text-[11px] text-[#777078]">
              Protected by PBKDF2 cryptography &amp; multi-tier rate limiting
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
