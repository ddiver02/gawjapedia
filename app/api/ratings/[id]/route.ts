import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * 평점 수정 요청 스키마
 */
const UpdateRatingSchema = z.object({
    rating: z.number().min(1).max(5).optional(),
    review: z.string().max(1000).optional(),
});

/**
 * GET /api/ratings/[id]
 * 
 * 특정 평점 조회
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const supabase = createClient();

        const { data, error } = await supabase
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
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: '평가를 찾을 수 없습니다',
                            code: 'RATING_NOT_FOUND',
                        },
                    },
                    { status: 404 }
                );
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: {
                rating: data,
            },
        });

    } catch (error) {
        console.error('Rating GET API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '평가 조회에 실패했습니다',
                    code: 'RATING_FETCH_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/ratings/[id]
 * 
 * 평점 수정 (인증 필요, 본인만 가능)
 * 
 * 요청 본문:
 * ```json
 * {
 *   "rating": 4,
 *   "review": "수정된 리뷰 내용"
 * }
 * ```
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
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

        // 기존 평가 확인 (본인 것인지 체크)
        const { data: existingRating, error: fetchError } = await supabase
            .from('ratings')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingRating) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '평가를 찾을 수 없습니다',
                        code: 'RATING_NOT_FOUND',
                    },
                },
                { status: 404 }
            );
        }

        // 권한 확인
        if (existingRating.user_id !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '본인의 평가만 수정할 수 있습니다',
                        code: 'FORBIDDEN',
                    },
                },
                { status: 403 }
            );
        }

        // 요청 본문 파싱 및 검증
        const body = await request.json();
        const validationResult = UpdateRatingSchema.safeParse(body);

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

        const updateData = validationResult.data;

        // 수정할 내용이 없으면 에러
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '수정할 내용이 없습니다',
                        code: 'NO_UPDATE_DATA',
                    },
                },
                { status: 400 }
            );
        }

        // 평점 수정
        const { data, error } = await supabase
            .from('ratings')
            .update(updateData)
            .eq('id', id)
            .select(`
        id,
        snack_id,
        rating,
        review,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          full_name
        )
      `)
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: {
                rating: data,
            },
            message: '평가가 수정되었습니다',
        });

    } catch (error) {
        console.error('Rating PUT API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '평가 수정에 실패했습니다',
                    code: 'RATING_UPDATE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/ratings/[id]
 * 
 * 평점 삭제 (인증 필요, 본인만 가능)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
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

        // 기존 평가 확인 (본인 것인지 체크)
        const { data: existingRating, error: fetchError } = await supabase
            .from('ratings')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingRating) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '평가를 찾을 수 없습니다',
                        code: 'RATING_NOT_FOUND',
                    },
                },
                { status: 404 }
            );
        }

        // 권한 확인
        if (existingRating.user_id !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '본인의 평가만 삭제할 수 있습니다',
                        code: 'FORBIDDEN',
                    },
                },
                { status: 403 }
            );
        }

        // 평점 삭제
        const { error } = await supabase
            .from('ratings')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: '평가가 삭제되었습니다',
        });

    } catch (error) {
        console.error('Rating DELETE API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '평가 삭제에 실패했습니다',
                    code: 'RATING_DELETE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
