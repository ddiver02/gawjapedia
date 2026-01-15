/**
 * Supabase Product Data Layer
 * 
 * Supabase에서 제품 데이터를 조회/생성/수정/삭제하는 함수들
 */

import { createClient } from '@/lib/supabase/server';
import type {
    Product,
    ProductSummary,
    NutritionInfo,
    ProductCategory,
    CreateRatingRequest,
    CreateCommentRequest,
} from '@/types/product';

/**
 * 모든 제품 조회
 */
export async function getAllProducts(): Promise<Product[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_infos')
        .select(`
      *,
      production_infos(*),
      mandatory_nutrient_infos(*),
      nutrient_vitamin_infos(*),
      nutrient_mineral_infos(*)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('제품 조회 실패:', error);
        throw new Error('제품 목록을 불러올 수 없습니다.');
    }

    return data.map(transformToProduct);
}

/**
 * ID로 제품 조회
 */
export async function getProductById(id: string): Promise<Product | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_infos')
        .select(`
      *,
      production_infos(*),
      mandatory_nutrient_infos(*),
      nutrient_vitamin_infos(*),
      nutrient_mineral_infos(*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error(`제품 ID ${id} 조회 실패:`, error);
        return null;
    }

    return transformToProduct(data);
}

/**
 * 카테고리별 제품 조회
 */
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_infos')
        .select(`
      *,
      production_infos(*),
      mandatory_nutrient_infos(*),
      nutrient_vitamin_infos(*),
      nutrient_mineral_infos(*)
    `)
        .eq('category', category)
        .order('score', { ascending: false });

    if (error) {
        console.error(`카테고리 ${category} 조회 실패:`, error);
        throw new Error('카테고리별 제품을 불러올 수 없습니다.');
    }

    return data.map(transformToProduct);
}

/**
 * 제품 검색 (이름 또는 제조사)
 */
export async function searchProducts(query: string): Promise<Product[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_infos')
        .select(`
      *,
      production_infos(*),
      mandatory_nutrient_infos(*),
      nutrient_vitamin_infos(*),
      nutrient_mineral_infos(*)
    `)
        .or(`title.ilike.%${query}%,manufacturer.ilike.%${query}%`)
        .order('score', { ascending: false });

    if (error) {
        console.error(`검색어 "${query}" 조회 실패:`, error);
        throw new Error('검색 결과를 불러올 수 없습니다.');
    }

    return data.map(transformToProduct);
}

/**
 * 제품 평점 조회
 */
export async function getProductRatings(productId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_ratings')
        .select('*')
        .eq('product_id', productId);

    if (error) {
        console.error(`제품 ${productId} 평점 조회 실패:`, error);
        return {
            avgPriceRating: 0,
            avgQualityRating: 0,
            totalRatings: 0,
        };
    }

    if (!data || data.length === 0) {
        return {
            avgPriceRating: 0,
            avgQualityRating: 0,
            totalRatings: 0,
        };
    }

    const avgPriceRating = data.reduce((sum, r) => sum + r.price_rating, 0) / data.length;
    const avgQualityRating = data.reduce((sum, r) => sum + r.quality_rating, 0) / data.length;

    return {
        avgPriceRating: Math.round(avgPriceRating * 10) / 10,
        avgQualityRating: Math.round(avgQualityRating * 10) / 10,
        totalRatings: data.length,
    };
}

/**
 * 평점 생성
 */
export async function createRating(request: CreateRatingRequest) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_ratings')
        .insert({
            product_id: request.productId,
            user_id: request.userId,
            price_rating: request.priceRating,
            quality_rating: request.qualityRating,
        })
        .select()
        .single();

    if (error) {
        console.error('평점 생성 실패:', error);
        throw new Error('평점을 저장할 수 없습니다.');
    }

    return data;
}

/**
 * 평점 업데이트
 */
export async function updateRating(
    productId: string,
    userId: string,
    priceRating: number,
    qualityRating: number
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_ratings')
        .update({
            price_rating: priceRating,
            quality_rating: qualityRating,
        })
        .eq('product_id', productId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('평점 업데이트 실패:', error);
        throw new Error('평점을 업데이트할 수 없습니다.');
    }

    return data;
}

/**
 * 제품 댓글 조회
 */
export async function getProductComments(productId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_comments')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`제품 ${productId} 댓글 조회 실패:`, error);
        return [];
    }

    return data || [];
}

/**
 * 댓글 생성
 */
export async function createComment(request: CreateCommentRequest) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('product_comments')
        .insert({
            product_id: request.productId,
            user_id: request.userId,
            comment: request.comment,
        })
        .select()
        .single();

    if (error) {
        console.error('댓글 생성 실패:', error);
        throw new Error('댓글을 저장할 수 없습니다.');
    }

    return data;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Supabase 데이터를 Product 타입으로 변환
 */
function transformToProduct(data: any): Product {
    const mandatory = data.mandatory_nutrient_infos;
    const vitamins = data.nutrient_vitamin_infos;
    const minerals = data.nutrient_mineral_infos;
    const production = data.production_infos;

    const nutrition: NutritionInfo = {
        // 필수 영양소
        calories: mandatory?.calories || 0,
        carbohydrate: mandatory?.carbohydrate || 0,
        sugars: mandatory?.sugars || 0,
        dietaryFiber: mandatory?.dietary_fiber || 0,
        protein: mandatory?.protein || 0,
        fat: mandatory?.fat || 0,
        saturatedFat: mandatory?.saturated_fat || 0,
        transFat: mandatory?.trans_fat || 0,
        cholesterol: mandatory?.cholesterol || 0,
        sodium: mandatory?.sodium || 0,

        // 비타민
        vitaminA: vitamins?.vitamin_a,
        vitaminD: vitamins?.vitamin_d,
        vitaminE: vitamins?.vitamin_e,
        vitaminK: vitamins?.vitamin_k,
        vitaminB1: vitamins?.vitamin_b1,
        vitaminB2: vitamins?.vitamin_b2,
        niacin: vitamins?.niacin,
        pantothenicAcid: vitamins?.pantothenic_acid,
        vitaminB6: vitamins?.vitamin_b6,
        biotin: vitamins?.biotin,
        folate: vitamins?.folate,
        vitaminB12: vitamins?.vitamin_b12,
        vitaminC: vitamins?.vitamin_c,

        // 미네랄
        calcium: minerals?.calcium,
        iron: minerals?.iron,
        magnesium: minerals?.magnesium,
        phosphorus: minerals?.phosphorus,
        potassium: minerals?.potassium,
        zinc: minerals?.zinc,
        copper: minerals?.copper,
        manganese: minerals?.manganese,
        iodine: minerals?.iodine,
        selenium: minerals?.selenium,
        chromium: minerals?.chromium,
        molybdenum: minerals?.molybdenum,
    };

    return {
        id: data.id,
        title: data.title,
        manufacturer: data.manufacturer,
        category: data.category,
        subCategory: data.sub_category,
        contentVolume: data.content_volume,
        price: data.price,
        score: data.score,
        description: data.description,
        imageUrl: data.image_url,
        nutrition,
        madeFrom: production?.made_from,
        maker: production?.maker,
        importer: production?.importer,
        distributor: production?.distributor,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}
