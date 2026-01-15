import { NextRequest, NextResponse } from 'next/server';
import { getProductById, getProductRatings, getProductComments } from '@/lib/supabase/products';

// API 라우트를 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/products/[id]
 * 
 * 제품 상세 정보 조회
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // 제품 정보 조회
        const product = await getProductById(id);

        if (!product) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '제품을 찾을 수 없습니다',
                        code: 'PRODUCT_NOT_FOUND',
                    },
                },
                { status: 404 }
            );
        }

        // 평점 정보 조회
        const ratings = await getProductRatings(id);

        // 댓글 조회
        const comments = await getProductComments(id);

        return NextResponse.json({
            success: true,
            data: {
                product: {
                    ...product,
                    avgPriceRating: ratings.avgPriceRating,
                    avgQualityRating: ratings.avgQualityRating,
                    totalRatings: ratings.totalRatings,
                },
                comments,
            },
        });

    } catch (error) {
        console.error('❌ Product detail API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '제품 정보를 불러오는 데 실패했습니다',
                    code: 'PRODUCT_FETCH_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
