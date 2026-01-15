/**
 * Product Type Definitions
 * 새로운 Supabase 스키마를 위한 TypeScript 타입 정의
 */

// ============================================
// Database Types (Supabase 테이블과 1:1 매칭)
// ============================================

export interface ProductInfo {
    id: string;
    title: string;
    manufacturer: string;
    category: string;
    sub_category: string | null;
    content_volume: string;
    price: number;
    score: number;
    description: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProductionInfo {
    product_id: string;
    made_from: string | null;
    maker: string | null;
    importer: string | null;
    distributor: string | null;
    created_at: string;
    updated_at: string;
}

export interface MandatoryNutrientInfo {
    product_id: string;
    calories: number;
    carbohydrate: number;
    sugars: number | null;
    dietary_fiber: number | null;
    protein: number;
    fat: number;
    saturated_fat: number | null;
    trans_fat: number | null;
    cholesterol: number | null;
    sodium: number;
    created_at: string;
    updated_at: string;
}

export interface NutrientVitaminInfo {
    product_id: string;
    vitamin_a: number | null;
    vitamin_d: number | null;
    vitamin_e: number | null;
    vitamin_k: number | null;
    vitamin_b1: number | null;
    vitamin_b2: number | null;
    niacin: number | null;
    pantothenic_acid: number | null;
    vitamin_b6: number | null;
    biotin: number | null;
    folate: number | null;
    vitamin_b12: number | null;
    vitamin_c: number | null;
    created_at: string;
    updated_at: string;
}

export interface NutrientMineralInfo {
    product_id: string;
    calcium: number | null;
    iron: number | null;
    magnesium: number | null;
    phosphorus: number | null;
    potassium: number | null;
    zinc: number | null;
    copper: number | null;
    manganese: number | null;
    iodine: number | null;
    selenium: number | null;
    chromium: number | null;
    molybdenum: number | null;
    created_at: string;
    updated_at: string;
}

export interface ProductRating {
    rating_id: string;
    product_id: string;
    user_id: string;
    price_rating: number; // 1-5
    quality_rating: number; // 1-5
    created_at: string;
    updated_at: string;
}

export interface ProductComment {
    comment_id: string;
    product_id: string;
    user_id: string;
    comment: string;
    agree: number;
    disagree: number;
    created_at: string;
    updated_at: string;
}

// ============================================
// Application Types (앱에서 사용하는 통합 타입)
// ============================================

/**
 * 통합 영양 정보
 */
export interface NutritionInfo {
    // 필수 영양소
    calories: number;
    carbohydrate: number;
    sugars: number;
    dietaryFiber: number;
    protein: number;
    fat: number;
    saturatedFat: number;
    transFat: number;
    cholesterol: number;
    sodium: number;

    // 비타민
    vitaminA?: number;
    vitaminD?: number;
    vitaminE?: number;
    vitaminK?: number;
    vitaminB1?: number;
    vitaminB2?: number;
    niacin?: number;
    pantothenicAcid?: number;
    vitaminB6?: number;
    biotin?: number;
    folate?: number;
    vitaminB12?: number;
    vitaminC?: number;

    // 미네랄
    calcium?: number;
    iron?: number;
    magnesium?: number;
    phosphorus?: number;
    potassium?: number;
    zinc?: number;
    copper?: number;
    manganese?: number;
    iodine?: number;
    selenium?: number;
    chromium?: number;
    molybdenum?: number;
}

/**
 * 제품 상세 정보 (조인된 데이터)
 */
export interface Product {
    id: string;
    title: string;
    manufacturer: string;
    category: string;
    subCategory?: string;
    contentVolume: string;
    price: number;
    score: number;
    description?: string;
    imageUrl?: string;

    // 영양 정보
    nutrition: NutritionInfo;

    // 생산 정보 (optional)
    madeFrom?: string;
    maker?: string;
    importer?: string;
    distributor?: string;

    // 평점 정보 (optional, 조회 시 계산)
    avgPriceRating?: number;
    avgQualityRating?: number;
    totalRatings?: number;

    // 메타데이터
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 제품 목록용 간략 정보
 */
export interface ProductSummary {
    id: string;
    title: string;
    manufacturer: string;
    category: string;
    price: number;
    score: number;
    calories: number;
    avgPriceRating?: number;
    avgQualityRating?: number;
    totalRatings?: number;
}

/**
 * 평점 생성 요청
 */
export interface CreateRatingRequest {
    productId: string;
    userId: string;
    priceRating: number;
    qualityRating: number;
}

/**
 * 댓글 생성 요청
 */
export interface CreateCommentRequest {
    productId: string;
    userId: string;
    comment: string;
}

// ============================================
// Utility Types
// ============================================

export type ProductCategory =
    | '과자'
    | '초콜릿'
    | '캔디'
    | '젤리'
    | '건과류'
    | '아이스크림'
    | '음료'
    | '기타';

// 기존 호환성을 위한 타입 (deprecated)
/** @deprecated Use Product instead */
export type Snack = Product;

/** @deprecated Use ProductCategory instead */
export type SnackCategory = ProductCategory;
