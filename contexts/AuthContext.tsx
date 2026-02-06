import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    subscriptionStatus: string | null;
    subscriptionEndDate: string | null;
    refreshSubscription: (email?: string) => Promise<any>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);

    const refreshSubscription = async (email?: string) => {
        try {
            const targetEmail = (email || user?.email)?.trim();
            if (targetEmail) {
                const subscriptionPromise = supabase
                    .from('trainers')
                    .select('subscription_status, subscription_end_date')
                    .ilike('email', targetEmail)
                    .single();

                const timeoutPromise = new Promise<{ data: any, error: any }>((_, reject) =>
                    setTimeout(() => reject(new Error('Subscription check timeout')), 5000)
                );

                const { data, error } = await Promise.race([
                    subscriptionPromise,
                    timeoutPromise as any
                ]);

                if (error) {
                    console.error('Error fetching subscription:', error);
                    throw error;
                }

                if (data) {
                    setSubscriptionStatus(data.subscription_status);
                    setSubscriptionEndDate(data.subscription_end_date);
                    return data;
                }
            }
            return null;
        } catch (err) {
            console.error('Failed to refresh subscription (timeout or error):', err);
            throw err;
        }
    };

    useEffect(() => {
        let mounted = true;

        // Safety timeout for initial session check
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth check taking too long, forcing loading(false)');
                setLoading(false);
            }
        }, 10000);

        // Check active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            try {
                if (!mounted) return;
                setSession(session);
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser?.email) {
                    await refreshSubscription(currentUser.email);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                if (mounted) {
                    clearTimeout(timeoutId);
                    setLoading(false);
                }
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                if (!mounted) return;
                setSession(session);
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser?.email) {
                    await refreshSubscription(currentUser.email);
                } else {
                    setSubscriptionStatus(null);
                    setSubscriptionEndDate(null);
                }
            } catch (err) {
                console.error('Auth change error:', err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            console.log('Iniciando logout...');
            // Limpa estados locais imediatamente para UI responder rápido
            setSubscriptionStatus(null);
            setSubscriptionEndDate(null);
            setUser(null);
            setSession(null);

            await supabase.auth.signOut();
            console.log('Logout concluído com sucesso.');
        } catch (err) {
            console.error('Logout error:', err);
            // Fallback: se o signOut do Supabase falhar, pelo menos limpamos o estado local
            setSubscriptionStatus(null);
            setSubscriptionEndDate(null);
            setUser(null);
            setSession(null);
        }
    };

    const value = {
        session,
        user,
        loading,
        subscriptionStatus,
        subscriptionEndDate,
        refreshSubscription,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
