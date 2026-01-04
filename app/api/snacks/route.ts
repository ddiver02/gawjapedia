import { NextRequest, NextResponse } from 'next/server';
import { fetchSnacksFromSheet, searchSnacks, fetchSnacksByCategory } from '@/lib/googleSheets';
import { SnackCategory } from '@/types/snack';

/**
 * GET /api/snacks
 * 
 * 간식 목록을 반환합니다
 * 
 * 쿼리 파라미터:
 * - category: 카테고리 필터 (예: /api/snacks?category=과자)
 * - search: 검색어 (예: /api/snacks?search=초코)
 * - page: 페이지 번호 (기본: 1)
 * - limit: 페이지당 결과 수 (기본: 20)
 * 
 * @example
 * ```
 * // 전체 목록
 * GET /api/snacks
 * 
 * // 카테고리 필터
 * GET /api/snacks?category=초콜릿
 * 
 * // 검색
 * GET /api/snacks?search=오레오
 * 
 * // 페이지네이션
 * GET /api/snacks?page=2&limit=10
 * ```
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const searchQuery = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let snacks;

        // 검색어가 있으면 검색
        if (searchQuery) {
            snacks = await searchSnacks(searchQuery);
        }
        // 카테고리 필터가 있으면 카테고리별 조회
        else if (category) {
            snacks = await fetchSnacksByCategory(category as SnackCategory);
        }
        // 둘 다 없으면 전체 조회
        else {
            snacks = await fetchSnacksFromSheet();
        }

        // 페이지네이션 적용
        const totalItems = snacks.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSnacks = snacks.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            data: {
                snacks: paginatedSnacks,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            },
        });

    } catch (error) {
        console.error('❌ Snacks API 에러:', error);

        // 환경 변수 확인 로그 (민감 정보 제외)
        console.log('환경 변수 확인:');
        console.log('- GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? '✅ 설정됨' : '❌ 없음');
        console.log('- GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ 설정됨' : '❌ 없음');
        console.log('- GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ 설정됨' : '❌ 없음');

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '간식 목록을 불러오는 데 실패했습니다',
                    code: 'SNACKS_FETCH_ERROR',
                    details: error instanceof Error ? error.stack : undefined,
                },
            },
            { status: 500 }
        );
    }
}
