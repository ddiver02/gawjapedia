import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

/**
 * 서버 컴포넌트 및 Server Actions용 Supabase 클라이언트
 * 
 * @example Server Component
 * ```typescript
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export default async function PrivatePage() {
 *   const supabase = createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   
 *   if (!user) {
 *     redirect('/login');
 *   }
 *   
 *   return <div>환영합니다, {user.email}!</div>;
 * }
 * ```
 * 
 * @example Server Action
 * ```typescript
 * 'use server';
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export async function createRating(formData: FormData) {
 *   const supabase = createClient();
 *   
 *   const { data, error } = await supabase
 *     .from('ratings')
 *     .insert({
 *       snack_id: formData.get('snack_id'),
 *       rating: parseInt(formData.get('rating') as string),
 *       review: formData.get('review'),
 *     });
 *   
 *   return { data, error };
 * }
 * ```
 */
export const createClient = () => {
    const cookieStore = cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Server Component에서 set은 실패할 수 있음 (읽기 전용)
                        // Middleware에서 처리됨
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Server Component에서 remove는 실패할 수 있음 (읽기 전용)
                        // Middleware에서 처리됨
                    }
                },
            },
        }
    );
};
