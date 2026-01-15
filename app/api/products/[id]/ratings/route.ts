import { NextRequest, NextResponse } from 'next/server';
import { createRating, updateRating } from '@/lib/supabase/products';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/products/[id]/ratings
 * 
 * 제품 평점 생성/업데이트
 * 
 * Body:
 * {
 *   priceRating: number (1-5),
 *   qualityRating: number (1-5)
 * }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
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

        const { priceRating, qualityRating } = await request.json();

        // 유효성 검사
        if (
            !priceRating || !qualityRating ||
            priceRating < 1 || priceRating > 5 ||
            qualityRating < 1 || qualityRating > 5
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '평점은 1-5 사이의 값이어야 합니다',
                        code: 'INVALID_RATING',
                    },
                },
                { status: 400 }
            );
        }

        const productId = params.id;

        // 기존 평점 확인
        const { data: existingRating } = await supabase
            .from('product_ratings')
            .select('rating_id')
            .eq('product_id', productId)
            .eq('user_id', user.id)
            .single();

        let result;

        if (existingRating) {
            // 업데이트
            result = await updateRating(productId, user.id, priceRating, qualityRating);
        } else {
            // 새로 생성
            result = await createRating({
                productId,
                userId: user.id,
                priceRating,
                qualityRating,
            });
        }

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('❌ Rating API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '평점 저장에 실패했습니다',
                    code: 'RATING_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
