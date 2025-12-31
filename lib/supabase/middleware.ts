import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase 인증 미들웨어
 * 모든 요청에서 세션을 갱신하고 쿠키를 업데이트합니다
 * 
 * 이 함수는 middleware.ts에서 사용됩니다
 * 
 * @param request - Next.js 요청 객체
 * @returns 업데이트된 응답 객체
 */
export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // 요청에 쿠키 설정 (다음 미들웨어로 전달)
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    // 응답에 쿠키 설정 (브라우저로 전달)
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    // 요청에서 쿠키 제거
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    // 응답에서 쿠키 제거
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // 세션 갱신 (만료되지 않도록)
    // IMPORTANT: 이 호출이 없으면 사용자가 로그아웃될 수 있습니다
    await supabase.auth.getUser();

    return response;
}
