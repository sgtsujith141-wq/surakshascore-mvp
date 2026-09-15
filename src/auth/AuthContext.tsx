import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const handleDeepLink = (url: string) => {
      console.log('DEEP LINK URL RECEIVED:', url);
      if (!url.includes('#access_token=')) return;
      
      Browser.close().catch(() => {});
      const hashPart = url.substring(url.indexOf('#') + 1);
      const params = new URLSearchParams(hashPart);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const provider_token = params.get('provider_token');
      
      console.log('EXTRACTED PARAMS:', { access_token: !!access_token, refresh_token: !!refresh_token, provider_token: !!provider_token });
      
      if (provider_token) {
        localStorage.setItem('provider_token', provider_token);
      }
      
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          console.log('SESSION SET SUCCESSFULLY');
        });
      }
    };

    let appUrlListener: any;
    let browserListener: any;

    if (Capacitor.isNativePlatform()) {
      // Handle cold start deep links
      CapacitorApp.getLaunchUrl().then(launchUrl => {
        if (launchUrl && launchUrl.url) {
          handleDeepLink(launchUrl.url);
        }
      });

      // Handle running app deep links
      CapacitorApp.addListener('appUrlOpen', (event) => {
        handleDeepLink(event.url);
      }).then(l => {
        appUrlListener = l;
      });
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
      if (appUrlListener) appUrlListener.remove();
      if (browserListener) browserListener.remove();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signUp: async (email, password, displayName) => {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.');
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        if (!data.user) throw new Error('Could not create your account.');
      },
      signIn: async (email, password) => {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.');
        }
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      },
      signInWithGoogle: async () => {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.');
        }
        if (Capacitor.isNativePlatform()) {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'com.sentinel.security://login-callback',
              skipBrowserRedirect: true
            }
          });
          if (error) throw error;
          if (data?.url) {
            // Return a promise that resolves when the browser is closed or session changes
            return new Promise<void>((resolve, reject) => {
              let isResolved = false;
              
              // Listen for browser close event (user cancelled or finished)
              Browser.addListener('browserFinished', () => {
                if (!isResolved) {
                  isResolved = true;
                  // If they didn't log in, this resolves cleanly and resets the UI busy state
                  resolve();
                }
              });

              // Listen for session change (successful login via deep link)
              const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
                if (event === 'SIGNED_IN' && !isResolved) {
                  isResolved = true;
                  resolve();
                  authListener.subscription.unsubscribe();
                }
              });

              Browser.open({ url: data.url }).catch((err) => {
                if (!isResolved) {
                  isResolved = true;
                  reject(err);
                }
              });
            });
          }
        } else {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin
            }
          });
          if (error) throw error;
        }
      },
      signOut: async () => {
        if (!isSupabaseConfigured) return;
        localStorage.removeItem('provider_token');
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
