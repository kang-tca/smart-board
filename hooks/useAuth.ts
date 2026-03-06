import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoginLoading, setIsLoginLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUser(session?.user || null);
            setIsAuthReady(true);
            setIsLoginLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user || null);
            setIsAuthReady(true);
            setIsLoginLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoginLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error: any) {
            console.error("Sign in failed", error);
            return { user: null, error };
        } finally {
            setIsLoginLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setIsLoginLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error: any) {
            console.error("Sign up failed", error);
            return { user: null, error };
        } finally {
            setIsLoginLoading(false);
        }
    };

    const signOut = async () => {
        setIsLoginLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error("Sign out failed", error);
            return { error };
        } finally {
            setIsLoginLoading(false);
        }
    };

    return {
        currentUser,
        isAuthReady,
        isLoginLoading,
        signIn,
        signUp,
        signOut
    };
};
