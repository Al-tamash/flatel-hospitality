"use client";

import * as React from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: "guest" | "admin";
  createdAt?: string;
}

export type AuthMode = "login" | "signup";

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string | null;
  authModalRedirect: string | null;
  authModalDefaultMode: AuthMode;
  openAuthModal: (
    reason?: string,
    redirectUrl?: string,
    defaultMode?: AuthMode,
    onSuccess?: () => void
  ) => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: string; confirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "reservation@flatel.in";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authModalReason, setAuthModalReason] = React.useState<string | null>(null);
  const [authModalRedirect, setAuthModalRedirect] = React.useState<string | null>(null);
  const [authModalDefaultMode, setAuthModalDefaultMode] = React.useState<AuthMode>("login");

  const onSuccessCallbackRef = React.useRef<(() => void) | null>(null);

  // Hydrate from localStorage and Supabase on mount
  React.useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // Synchronize identity only from the verified Supabase session.
    async function syncSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setSupabaseUser(session.user);
          const email = session.user.email || "";
          const meta = session.user.user_metadata || {};
          const isUserAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

          const profile: UserProfile = {
            id: session.user.id,
            email: email,
            phone: meta.phone || "",
            fullName: meta.full_name || meta.name || email.split("@")[0] || "Guest",
            role: isUserAdmin ? "admin" : "guest",
          };

          setUser(profile);
        }
      } catch (err) {
        console.warn("Supabase auth session sync error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    syncSession();

    // Listen to Supabase auth state change events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setSupabaseUser(session.user);
        const email = session.user.email || "";
        const meta = session.user.user_metadata || {};
        const isUserAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        const profile: UserProfile = {
          id: session.user.id,
          email: email,
          phone: meta.phone || "",
          fullName: meta.full_name || meta.name || email.split("@")[0] || "Guest",
          role: isUserAdmin ? "admin" : "guest",
        };

        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = React.useCallback(
    (
      reason?: string,
      redirectUrl?: string,
      defaultMode: AuthMode = "login",
      onSuccess?: () => void
    ) => {
      setAuthModalReason(reason || null);
      setAuthModalRedirect(redirectUrl || null);
      setAuthModalDefaultMode(defaultMode);
      onSuccessCallbackRef.current = onSuccess || null;
      setIsAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = React.useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    setAuthModalRedirect(null);
    onSuccessCallbackRef.current = null;
  }, []);

  const triggerPostAuth = React.useCallback(() => {
    setIsAuthModalOpen(false);
    if (onSuccessCallbackRef.current) {
      onSuccessCallbackRef.current();
      onSuccessCallbackRef.current = null;
    }
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = createClient();

    try {
      // 1. Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data.user) {
        if (cleanEmail === ADMIN_EMAIL) {
          const response = await fetch("/api/admin/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "login", email: cleanEmail, password }),
          });
          if (!response.ok) {
            await supabase.auth.signOut();
            setSupabaseUser(null);
            setUser(null);
            const result = await response.json().catch(() => null);
            return { error: result?.error || "Administrator authentication could not be completed." };
          }
        }
        triggerPostAuth();
        return {};
      }

      return {
        error:
          error?.message ||
          "No account found with this email. Please click 'Create Account' to register.",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error during sign in.";
      return { error: message };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = createClient();

    if (cleanEmail === ADMIN_EMAIL) {
      return { error: "Administrator accounts cannot be created through guest registration." };
    }

    try {
      const newProfile: UserProfile = {
        id: `usr_reg_${Date.now().toString().slice(-6)}`,
        email: cleanEmail,
        phone: "",
        fullName: fullName.trim(),
        role: "guest",
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: "",
          },
        },
      });
      if (error) return { error: error.message };
      if (!data.session || !data.user) {
        return { confirmationRequired: true };
      }

      newProfile.id = data.user.id;
      setSupabaseUser(data.user);
      setUser(newProfile);
      triggerPostAuth();
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating account.";
      return { error: message };
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {}

    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}

    setUser(null);
    setSupabaseUser(null);
  };

  const isAdmin = supabaseUser?.email?.toLowerCase() === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        isAdmin,
        isAuthModalOpen,
        authModalReason,
        authModalRedirect,
        authModalDefaultMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
