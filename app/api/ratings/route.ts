import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * 평점 생성 요청 스키마
 */
const CreateRatingSchema = z.object({
    snackId: z.string().min(1, '간식 ID가 필요합니다'),
    rating: z.number().min(1).max(5, '평점은 1-5 사이여야 합니다'),
    review: z.string().max(1000, '리뷰는 1000자를 초과할 수 없습니다').optional(),
});

/**
 * GET /api/ratings
 * 
 * 평점 목록 조회
 * 
 * 쿼리 파라미터:
 * - snack_id: 특정 간식의 평점만 조회
 * - user_id: 특정 사용자의 평점만 조회
 * - limit: 최대 결과 수 (기본: 20)
 * - offset: 시작 위치 (기본: 0)
 * 
 * @example
 * GET /api/ratings?snack_id=1&limit=10
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const snackId = searchParams.get('snack_id');
        const userId = searchParams.get('user_id');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = createClient();

        let query = supabase
            .from('ratings')
            .select(`
        id,
        snack_id,
        rating,
        review,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // 필터 적용
        if (snackId) {
            query = query.eq('snack_id', snackId);
        }

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: {
                ratings: data,
                pagination: {
                    limit,
                    offset,
                    total: count || 0,
                },
            },
        });

    } catch (error) {
        console.error('Ratings GET API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '평점 목록을 불러오는 데 실패했습니다',
                    code: 'RATINGS_FETCH_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ratings
 * 
 * 새 평점 작성 (인증 필요)
 * 
 * 요청 본문:
 * ```json
 * {
 *   "snackId": "1",
 *   "rating": 5,
 *   "review": "정말 맛있어요!"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        // 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '로그인이 필요합니다',
                        code: 'UNAUTHORIZED',
                    },
                },
                { status: 401 }
            );
        }

        // 요청 본문 파싱 및 검증
        const body = await request.json();
        const validationResult = CreateRatingSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '잘못된 요청 형식입니다',
                        code: 'VALIDATION_ERROR',
                        details: validationResult.error.errors,
                    },
                },
                { status: 400 }
            );
        }

        const { snackId, rating, review } = validationResult.data;

        // 평점 생성
        const { data, error } = await supabase
            .from('ratings')
            .insert({
                user_id: user.id,
                snack_id: snackId,
                rating,
                review: review || null,
            })
            .select(`
        id,
        snack_id,
        rating,
        review,
        created_at,
        profiles:user_id (
          username,
          full_name
        )
      `)
            .single();

        if (error) {
            // 중복 오류 처리 (한 사용자가 같은 간식에 이미 평가한 경우)
            if (error.code === '23505') {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: '이미 이 간식에 대한 평가를 작성하셨습니다. 수정하시려면 PUT 요청을 사용하세요.',
                            code: 'DUPLICATE_RATING',
                        },
                    },
                    { status: 409 }
                );
            }

            throw error;
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    rating: data,
                },
                message: '평가가 등록되었습니다',
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Ratings POST API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '평가 등록에 실패했습니다',
                    code: 'RATING_CREATE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
