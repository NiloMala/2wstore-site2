import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase';
import type { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  register: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Track if component is mounted
  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string, event?: string, sessionObj?: any): Promise<User | null> => {
    const maxAttempts = 5;
    let attempt = 0;

    while (attempt < maxAttempts) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !profile) return null;

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone || undefined,
          avatarUrl: profile.avatar_url || undefined,
          createdAt: new Date(profile.created_at),
        };
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.message?.toLowerCase?.().includes('aborted')) {
          attempt += 1;
          const backoff = 250 * attempt;
          console.warn(`fetchUserProfile AbortError (event: ${event}) [attempt ${attempt}/${maxAttempts}]`, {
            userId,
            session: sessionObj,
            error: err
          });
          await new Promise((res) => setTimeout(res, backoff));
          continue;
        }
        console.error('fetchUserProfile error:', err);
        return null;
      }
    }

    console.error('fetchUserProfile failed after retries', { userId, event, session: sessionObj });
    return null;
  };

  // Check if user is admin
  const checkIsAdmin = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      return !error && data === true;
    } catch {
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        try {
          await new Promise((res) => setTimeout(res, 250));
          const profile = await fetchUserProfile(session.user.id, 'INITIAL', session);
          if (isMountedRef.current) setUser(profile);
          const adminStatus = await checkIsAdmin();
          if (isMountedRef.current) setIsAdmin(adminStatus);
        } catch (err) {
          console.error('Error fetching initial profile:', err);
        }
      }

      if (isMountedRef.current) setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          console.log('Auth event:', event);
          if (isMountedRef.current) setSession(session);

          if (session?.user) {
            try {
              if (event === 'SIGNED_IN') await new Promise((res) => setTimeout(res, 250));
              const profile = await fetchUserProfile(session.user.id, event, session);
              if (isMountedRef.current) setUser(profile);
              const adminStatus = await checkIsAdmin();
              if (isMountedRef.current) setIsAdmin(adminStatus);
            } catch (err) {
              console.error('Error during auth state change handling:', err);
              try {
                await new Promise((res) => setTimeout(res, 400));
                const profile = await fetchUserProfile(session.user.id, event + '_RETRY', session);
                if (isMountedRef.current) setUser(profile);
                const adminStatus = await checkIsAdmin();
                if (isMountedRef.current) setIsAdmin(adminStatus);
              } catch (err2) {
                console.error('Retry failed:', err2);
                if (isMountedRef.current) {
                  setUser(null);
                  setIsAdmin(false);
                }
              }
            }
          } else {
            if (isMountedRef.current) {
              setUser(null);
              setIsAdmin(false);
            }
          }

          if (isMountedRef.current) setIsLoading(false);
        })();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Check for email not confirmed
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.',
            needsConfirmation: true
          };
        }

        // Translate common errors
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha incorretos' };
        }

        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao fazer login' };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        // Translate common errors
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          return { success: false, error: 'Este email já está cadastrado' };
        }
        if (error.message.includes('Password')) {
          return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
        }

        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          needsConfirmation: true
        };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar conta' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao enviar email' };
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao atualizar perfil' };
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao reenviar email' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isAdmin,
      isLoading,
      login,
      register,
      logout,
      resetPassword,
      updateProfile,
      resendConfirmationEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
