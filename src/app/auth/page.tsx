"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, KeyRound } from "lucide-react";
import { BackgroundEffects } from "@/components/BackgroundEffects";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const type = isForgotPassword ? 'reset' : 'register';
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setOtpSent(true);
      setSuccess("Verification code sent!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isForgotPassword) {
        // Reset Password
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword: password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Reset failed");
        
        setSuccess("Password reset successfully! You can now sign in.");
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLogin(true);
          setOtpSent(false);
          setPassword("");
          setConfirmPassword("");
          setOtp("");
          setSuccess("");
        }, 2000);
      } else if (isLogin) {
        // Login
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        if (res?.error) {
          throw new Error(res.error);
        }
        
        router.push("/");
        router.refresh();
      } else {
        // Register
        if (!otpSent) return;
        
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");
        
        // Auto login after register
        await signIn("credentials", { redirect: false, email, password });
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsForgotPassword(false);
    setIsLogin(!isLogin);
    setOtpSent(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)] overflow-hidden">
      <BackgroundEffects />
      
      <div className="w-full max-w-md bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {isForgotPassword 
                ? "Enter your email to receive a reset code" 
                : isLogin 
                  ? "Sign in to access your saved links" 
                  : "Join Linked Store today"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 text-red-500 text-sm font-medium rounded-xl text-center border border-red-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-xl text-center border border-emerald-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              {success}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={(!isLogin && otpSent) || (isForgotPassword && otpSent)}
                  className="w-full pl-11 pr-4 py-3 bg-black/10 dark:bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-60 text-slate-900 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {((!isLogin || isForgotPassword) && !otpSent) && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !email}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white rounded-xl font-medium transition-all disabled:opacity-50 border border-white/10 backdrop-blur-md"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            )}

            {(isLogin || (!isLogin && otpSent) || (isForgotPassword && otpSent)) && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isForgotPassword ? "New Password" : "Password"}
                  </label>
                  {isLogin && !isForgotPassword && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError("");
                        setSuccess("");
                      }}
                      className="text-xs text-indigo-600 dark:text-cyan-400 hover:underline focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/10 dark:bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            
            {(isForgotPassword && otpSent) && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/10 dark:bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {((!isLogin && otpSent) || (isForgotPassword && otpSent)) && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/10 dark:bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all tracking-widest text-slate-900 dark:text-white font-mono"
                    placeholder="123456"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1">
                  (Check the terminal running the Next.js server for the code if you didn't setup an email provider)
                </p>
              </div>
            )}

            {(isLogin || (!isLogin && otpSent) || (isForgotPassword && otpSent)) && (
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-indigo-500/25 mt-6"
              >
                {loading 
                  ? "Please wait..." 
                  : isForgotPassword 
                    ? "Reset Password" 
                    : isLogin 
                      ? "Sign In" 
                      : "Complete Registration"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            )}
          </form>
        </div>
        
        <div className="px-8 py-5 bg-black/10 dark:bg-black/40 border-t border-white/5 text-center backdrop-blur-md">
          {isForgotPassword ? (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setIsLogin(true);
                setOtpSent(false);
                setError("");
                setSuccess("");
              }}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 font-medium transition-colors"
            >
              Remembered your password? Back to login
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
