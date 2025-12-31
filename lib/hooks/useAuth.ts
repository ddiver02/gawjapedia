'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

/**
 * 인증 상태를 관리하는 커스텀 훅
 * 
 * @returns {Object} 인증 관련 상태 및 함수
 * @property {User | null} user - 현재 로그인한 사용자 정보
 * @property {boolean} loading - 로딩 상태
 * @property {Function} signIn - 로그인 함수
 * @property {Function} signUp - 회원가입 함수
 * @property {Function} signOut - 로그아웃 함수
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, signIn, signOut } = useAuth();
 * 
 *   if (loading) return <div>로딩중...</div>;
 *  
 *   if (!user) {
 *     return <button onClick={() => signIn('email@example.com', 'password')}>
 *       로그인
 *     </button>;
 *   }
 * 
 *   return <div>환영합니다, {user.email}!</div>;
 * }
 * ```
 */
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // 현재 세션 확인
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        // 인증 상태 변화 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    /**
     * 이메일/비밀번호로 로그인
     */
    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    };

    /**
     * 회원가입
     */
    const signUp = async (email: string, password: string, username?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });

        if (error) throw error;
        return data;
    };

    /**
     * 로그아웃
     */
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    };
}
