import { NextRequest, NextResponse } from 'next/server';
import {
    getAllProducts,
    getProductsByCategory,
    searchProducts,
    getProductRatings,
} from '@/lib/supabase/products';
import type { ProductCategory } from '@/types/product';

// API 라우트를 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/products
 * 
 * 제품 목록 조회 API
 * 
 * 쿼리 파라미터:
 * - category: 카테고리 필터
 * - search: 검색어
 * - page: 페이지 번호 (기본: 1)
 * - limit: 페이지당 개수 (기본: 20)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category') as ProductCategory | null;
        const searchQuery = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let products;

        // 검색어가 있으면 검색
        if (searchQuery) {
            products = await searchProducts(searchQuery);
        }
        // 카테고리 필터가 있으면 카테고리별 조회
        else if (category) {
            products = await getProductsByCategory(category);
        }
        // 둘 다 없으면 전체 조회
        else {
            products = await getAllProducts();
        }

        // 각 제품의 평점 정보 추가
        const productsWithRatings = await Promise.all(
            products.map(async (product) => {
                const ratings = await getProductRatings(product.id);
                return {
                    ...product,
                    avgPriceRating: ratings.avgPriceRating,
                    avgQualityRating: ratings.avgQualityRating,
                    totalRatings: ratings.totalRatings,
                };
            })
        );

        // 페이지네이션 적용
        const totalItems = productsWithRatings.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = productsWithRatings.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            data: {
                products: paginatedProducts,
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
        console.error('❌ Products API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '제품 목록을 불러오는 데 실패했습니다',
                    code: 'PRODUCTS_FETCH_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
