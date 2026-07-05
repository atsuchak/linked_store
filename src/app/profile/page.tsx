"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { motion, AnimatePresence } from "framer-motion";
import { useLinkStore } from "@/store/linkStore";
import { Camera, User, Phone, Mail, Lock, ShieldAlert, Trash2, CheckCircle2, LogOut, Link as LinkIcon, AlertTriangle, Eye, EyeOff, KeyRound } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clearLocalLinks } = useLinkStore();

  // Profile States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // UI States
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [deletingAllLinks, setDeletingAllLinks] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: success | error

  // Modal States
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutAllModalOpen, setIsLogoutAllModalOpen] = useState(false);
  const [isDeleteAllLinksModalOpen, setIsDeleteAllLinksModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setImage(data.image || null);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage("Image size should be less than 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showMessage("Profile updated successfully!", "success");
      // Force reload to update navbar image
      window.location.reload();
    } catch (error: any) {
      showMessage(error.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendOtp = async () => {
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setOtpSent(true);
      setIsForgotPassword(true);
      showMessage("Verification code sent!", "success");
    } catch (err: any) {
      showMessage(err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      if (newPassword.length < 6) throw new Error("New password must be at least 6 characters");

      if (isForgotPassword) {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Reset failed");

        showMessage("Password reset successfully!", "success");
        setIsForgotPassword(false);
        setOtpSent(false);
        setOtp("");
        setNewPassword("");
      } else {
        const res = await fetch("/api/user/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showMessage("Password changed successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (error: any) {
      showMessage(error.message || "Failed to change password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async () => {
    setIsDeleteAccountModalOpen(false);
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Account deleted successfully.");
      signOut({ callbackUrl: "/" });
    } catch (error: any) {
      showMessage(error.message || "Failed to delete account", "error");
      setDeleting(false);
    }
  };

  const logoutAllDevices = async () => {
    setIsLogoutAllModalOpen(false);
    setLoggingOutAll(true);
    try {
      const res = await fetch("/api/user/logout-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Logged out from all devices successfully.");
      signOut({ callbackUrl: "/" });
    } catch (error: any) {
      showMessage(error.message || "Failed to logout from all devices", "error");
      setLoggingOutAll(false);
    }
  };

  const deleteAllLinks = async () => {
    setIsDeleteAllLinksModalOpen(false);
    setDeletingAllLinks(true);
    try {
      if (status === "authenticated") {
        const res = await fetch("/api/links/delete-all", { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message);
        }
      }
      clearLocalLinks();
      showMessage("All links deleted successfully.", "success");
    } catch (error: any) {
      showMessage(error.message || "Failed to delete all links", "error");
    } finally {
      setDeletingAllLinks(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
      <BackgroundEffects />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">

        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] p-4 rounded-xl backdrop-blur-xl border flex items-center space-x-3 shadow-2xl min-w-[300px] justify-center ${message.type === 'success'
                ? 'bg-emerald-500/90 border-emerald-500/30 text-white dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400'
                : 'bg-red-500/90 border-red-500/30 text-white dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400'
              }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              <span className="font-medium whitespace-nowrap">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6 gap-2 mt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">Profile Settings</h2>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 hover:bg-red-50 dark:bg-white/10 dark:hover:bg-red-500/10 text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-white/10 hover:border-red-500/30 rounded-xl text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>

          <form onSubmit={saveProfile} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-black shadow-lg overflow-hidden flex items-center justify-center">
                  {image ? (
                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                  title="Change Picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{name || "Linked User"}</h3>
                <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <Mail className="w-3 h-3" /> {email}
                </p>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="text-xs text-red-500 hover:text-red-600 mt-2 font-medium"
                  >
                    Remove Picture
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-white/5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-md"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Security</h2>
          <form onSubmit={changePassword} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {!isForgotPassword && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {isForgotPassword && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Verification Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all tracking-widest text-slate-900 dark:text-white font-mono"
                      placeholder="123456"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Cancel Reset
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={savingPassword}
                  className="text-sm font-medium text-indigo-600 dark:text-cyan-400 hover:underline transition-colors focus:outline-none"
                >
                  Forgot Password?
                </button>
              )}
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Data & Security Management</h2>
          <div className="space-y-6">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-500 dark:text-cyan-400" /> Active Sessions
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Log out of all other devices you might have logged in from.
                </p>
              </div>
              <button
                onClick={() => setIsLogoutAllModalOpen(true)}
                disabled={loggingOutAll}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-orange-50 dark:bg-white/10 dark:hover:bg-orange-500/10 text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-white/10 hover:border-orange-500/30 rounded-xl font-medium transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
                {loggingOutAll ? "Logging out..." : "Logout All Devices"}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-orange-500" /> Delete All Links
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Remove all saved links from your account. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteAllLinksModalOpen(true)}
                disabled={deletingAllLinks}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-orange-50 dark:bg-white/10 dark:hover:bg-orange-500/10 text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-white/10 hover:border-orange-500/30 rounded-xl font-medium transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                {deletingAllLinks ? "Deleting..." : "Delete All Links"}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Account Deletion
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Permanently delete your account and all saved links. This action is irreversible.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteAccountModalOpen(true)}
                disabled={deleting}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-red-50 dark:bg-white/10 dark:hover:bg-red-500/10 text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-white/10 hover:border-red-500/30 rounded-xl font-medium transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>

          </div>
        </div>

      </div>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] p-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <LogOut className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Log Out</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Are you sure you want to log out of your account?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="flex-1 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isLogoutAllModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutAllModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] p-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Logout All Devices</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  This will log you out from all devices, including this one. Continue?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsLogoutAllModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={logoutAllDevices}
                    className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Logout All
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isDeleteAllLinksModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteAllLinksModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] p-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-4">
                  <LinkIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete All Links</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Are you sure you want to delete all your saved links? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsDeleteAllLinksModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAllLinks}
                    className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isDeleteAccountModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteAccountModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] p-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Account</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Deletes account and cloud links. Local data remains unless you also click 'Delete All Links'. Proceed?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsDeleteAccountModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAccount}
                    className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
