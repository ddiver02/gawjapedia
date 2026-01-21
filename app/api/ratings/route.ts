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
 * - product_id: 특정 제품의 평점만 조회
 * - user_id: 특정 사용자의 평점만 조회
 * - limit: 최대 결과 수 (기본: 20)
 * - offset: 시작 위치 (기본: 0)
 * 
 * @example
 * GET /api/ratings?product_id=1&limit=10
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const productId = searchParams.get('product_id') || searchParams.get('snack_id'); // backward compat
        const userId = searchParams.get('user_id');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = createClient();

        let query = supabase
            .from('product_ratings')
            .select(`
                rating_id,
                product_id,
                user_id,
                price_rating,
                quality_rating,
                created_at,
                updated_at
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // 필터 적용
        if (productId) {
            query = query.eq('product_id', productId);
        }

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        // Transform to include average rating for backward compatibility
        const transformedData = data?.map((rating: any) => ({
            id: rating.rating_id,
            snack_id: rating.product_id, // backward compat
            product_id: rating.product_id,
            user_id: rating.user_id,
            rating: Math.round((rating.price_rating + rating.quality_rating) / 2), // average for backward compat
            price_rating: rating.price_rating,
            quality_rating: rating.quality_rating,
            review: null, // Old ratings table had review, new one uses comments table
            created_at: rating.created_at,
            updated_at: rating.updated_at,
        }));

        return NextResponse.json({
            success: true,
            data: {
                ratings: transformedData,
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
 *   "productId": "1",
 *   "priceRating": 4,
 *   "qualityRating": 5
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

        const body = await request.json();
        const productId = body.productId || body.snackId; // backward compat
        const priceRating = body.priceRating || body.rating; // backward compat
        const qualityRating = body.qualityRating || body.rating; // backward compat

        if (!productId || !priceRating || !qualityRating) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '필수 필드가 누락되었습니다 (productId, priceRating, qualityRating)',
                        code: 'VALIDATION_ERROR',
                    },
                },
                { status: 400 }
            );
        }

        // Check for existing rating
        const { data: existingRating } = await supabase
            .from('product_ratings')
            .select('rating_id')
            .eq('product_id', productId)
            .eq('user_id', user.id)
            .single();

        let result;

        if (existingRating) {
            // Update existing rating
            const { data, error } = await supabase
                .from('product_ratings')
                .update({
                    price_rating: priceRating,
                    quality_rating: qualityRating,
                    updated_at: new Date().toISOString(),
                })
                .eq('rating_id', existingRating.rating_id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new rating
            const { data, error } = await supabase
                .from('product_ratings')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    price_rating: priceRating,
                    quality_rating: qualityRating,
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    rating: {
                        id: result.rating_id,
                        product_id: result.product_id,
                        price_rating: result.price_rating,
                        quality_rating: result.quality_rating,
                        created_at: result.created_at,
                    },
                },
                message: '평가가 등록되었습니다',
            },
            { status: existingRating ? 200 : 201 }
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
