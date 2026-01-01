/**
 * 간식 영양 정보 인터페이스
 * Google Sheets의 영양성분 컬럼과 1:1 매핑
 */
export interface NutritionInfo {
    calories: number;          // 열량(Kcal)
    sodium: number;            // 나트륨(mg)
    carbohydrate: number;      // 탄수화물(g)
    dietaryFiber: number;      // 식이섬유(g)
    sugars: number;            // 당류(g)
    fat: number;               // 지방(g)
    transFat: number;          // 트랜스지방(g)
    saturatedFat: number;      // 포화지방(g)
    cholesterol: number;       // 콜레스테롤(mg)
    protein: number;           // 단백질(g)
    lactose: number;           // 유당(g)
    calcium: number;           // 칼슘(mg)
    iron: number;              // 철분(mg)
    zinc: number;              // 아연(mg)
    magnesium: number;         // 마그네슘(mg)
    vitaminA: number;          // 비타민A(µg)
    vitaminB1: number;         // 비타민B1(mg)
    vitaminB2: number;         // 비타민B2(mg)
    vitaminB6: number;         // 비타민B6(mg)
    vitaminC: number;          // 비타민C(mg)
    vitaminE: number;          // 비타민E(mg)
    niacin: number;            // 나이아신(mg)
    pantothenicAcid: number;   // 판토텐산(mg)
    folicAcid: number;         // 엽산(µg)
}

/**
 * 간식 카테고리
 */
export type SnackCategory =
    | '과자'
    | '초콜릿'
    | '캔디'
    | '젤리'
    | '건과류'
    | '아이스크림'
    | '음료'
    | '기타';

/**
 * 간식 정보 인터페이스
 * Google Sheets의 모든 컬럼을 포함
 */
export interface Snack {
    id: string;                    // 고유 ID
    name: string;                  // 상품명
    manufacturer: string;          // 제조원
    category: SnackCategory;       // 분류
    category2?: string;            // 분류2 (선택)
    category3?: string;            // 분류3 (선택)
    contentVolume: string;         // 내용량 (예: "100g", "500ml")
    price: number;                 // 가격 (원)
    score: number;                 // 종합 점수
    description: string;           // 설명
    nutrition: NutritionInfo;      // 영양 성분 정보
    imageUrl?: string;             // 이미지 URL (선택)
    tags?: string[];               // 태그 (예: ['달콤한', '바삭한'])
}

/**
 * Google Sheets에서 가져온 원시 데이터 타입
 */
export interface SnackRawData {
    id: string;
    상품명: string;
    제조원: string;
    분류: string;
    분류2?: string;
    분류3?: string;
    내용량: string;
    '가격(원)': string | number;
    점수: string | number;
    설명: string;
    '열량(kcal)': string | number;
    '나트륨(mg)': string | number;
    '탄수화물(g)': string | number;
    '식이섬유(g)': string | number;
    '당류(g)': string | number;
    '지방(g)': string | number;
    '트랜스지방(g)': string | number;
    '포화지방(g)': string | number;
    '콜레스테롤(mg)': string | number;
    '단백질(g)': string | number;
    '유당(g)': string | number;
    '칼슘(mg)': string | number;
    '철분(mg)': string | number;
    '아연(mg)': string | number;
    '마그네슘(mg)': string | number;
    '비타민A(μg)': string | number;
    '비타민B1(mg)': string | number;
    '비타민B2(mg)': string | number;
    '비타민B6(mg)': string | number;
    '비타민C(mg)': string | number;
    '비타민E(mg)': string | number;
    '나이아신(mg)': string | number;
    '판토텐산(mg)': string | number;
    '엽산(μg)': string | number;
}

/**
 * 간식 목록 필터 옵션
 */
export interface SnackFilter {
    category?: SnackCategory;
    minPrice?: number;
    maxPrice?: number;
    minScore?: number;
    searchQuery?: string;
    tags?: string[];
}

/**
 * 페이지네이션 정보
 */
export interface Pagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

/**
 * 간식 목록 응답
 */
export interface SnacksResponse {
    snacks: Snack[];
    pagination: Pagination;
}
