import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

/**
 * 클라이언트 컴포넌트용 Supabase 클라이언트
 * 브라우저에서 실행되며 사용자 세션을 관리합니다
 * 
 * @example
 * ```typescript
 * import { supabase } from '@/lib/supabase/client';
 * 
 * // 로그인
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 * 
 * // 데이터 조회
 * const { data: ratings } = await supabase
 *   .from('ratings')
 *   .select('*')
 *   .eq('snack_id', '1');
 * ```
 */
export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};
