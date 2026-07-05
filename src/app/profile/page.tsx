"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { Camera, User, Phone, Mail, Lock, ShieldAlert, Trash2, CheckCircle2, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: success | error

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
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
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

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      if (newPassword.length < 6) throw new Error("New password must be at least 6 characters");
      
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showMessage("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      showMessage(error.message || "Failed to change password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("WARNING: This will permanently delete your account and ALL your saved links. This action cannot be undone. Are you absolutely sure?")) {
      return;
    }
    
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
    if (!window.confirm("This will log you out from all devices, including this one. Continue?")) {
      return;
    }

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
        
        {message.text && (
          <div className={`p-4 rounded-xl backdrop-blur-md border animate-in fade-in slide-in-from-top-4 flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6 gap-2 mt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">Profile Settings</h2>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 hover:bg-red-500/10 text-slate-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-white/10 hover:border-red-500/30 rounded-xl text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500 dark:text-cyan-400" /> Active Sessions
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Log out of all other devices you might have logged in from. You will also be logged out here.
              </p>
            </div>
            <button
              onClick={logoutAllDevices}
              disabled={loggingOutAll}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-orange-500/10 text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 border border-slate-200 dark:border-white/10 hover:border-orange-500/30 rounded-xl font-medium transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
              {loggingOutAll ? "Logging out..." : "Logout All Devices"}
            </button>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-slate-500" /> Account Deletion
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Permanently delete your account and all saved links. This action is irreversible.
              </p>
            </div>
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-red-500/10 text-slate-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-white/10 hover:border-red-500/30 rounded-xl font-medium transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Trash2 className="w-5 h-5" />
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
