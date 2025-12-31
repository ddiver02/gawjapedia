import { NextRequest, NextResponse } from 'next/server';
import { fetchSnackById } from '@/lib/googleSheets';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/snacks/[id]
 * 
 * 특정 간식의 상세 정보를 반환합니다
 * 평균 평점 및 리뷰 정보도 함께 포함됩니다
 * 
 * @param params - { id: string }
 * @returns 간식 상세 정보 + 평점 통계
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // 간식 정보 조회
        const snack = await fetchSnackById(id);

        if (!snack) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '간식을 찾을 수 없습니다',
                        code: 'SNACK_NOT_FOUND',
                    },
                },
                { status: 404 }
            );
        }

        // Supabase에서 평점 정보 조회
        const supabase = createClient();
        const { data: ratingsData, error: ratingsError } = await supabase
            .from('snack_ratings_summary')
            .select('*')
            .eq('snack_id', id)
            .single();

        if (ratingsError && ratingsError.code !== 'PGRST116') {
            // PGRST116은 "not found" 에러 (정상)
            console.error('평점 조회 에러:', ratingsError);
        }

        // 최근 리뷰 3개 조회
        const { data: recentReviews, error: reviewsError } = await supabase
            .from('ratings')
            .select(`
        id,
        rating,
        review,
        created_at,
        profiles:user_id (
          username,
          full_name
        )
      `)
            .eq('snack_id', id)
            .order('created_at', { ascending: false })
            .limit(3);

        if (reviewsError) {
            console.error('리뷰 조회 에러:', reviewsError);
        }

        return NextResponse.json({
            success: true,
            data: {
                snack,
                ratings: {
                    totalRatings: ratingsData?.total_ratings || 0,
                    averageRating: ratingsData?.average_rating || 0,
                    lastRatedAt: ratingsData?.last_rated_at || null,
                },
                recentReviews: recentReviews || [],
            },
        });

    } catch (error) {
        console.error('Snack detail API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '간식 정보를 불러오는 데 실패했습니다',
                    code: 'SNACK_DETAIL_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
