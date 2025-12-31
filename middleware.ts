import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js 미들웨어
 * 
 * 모든 요청에서 실행되며 다음을 처리합니다:
 * 1. Supabase 세션 갱신
 * 2. 보호된 경로 접근 제어
 * 
 * 보호된 경로:
 * - /profile
 * - /recommendations
 * - /test (선호도 테스트)
 */
export async function middleware(request: NextRequest) {
    // Supabase 세션 갱신
    return await updateSession(request);
}

/**
 * 미들웨어가 실행될 경로 패턴
 * API 경로와 정적 파일은 제외
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
