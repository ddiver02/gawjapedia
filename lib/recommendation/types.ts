/**
 * 추천 시스템 타입 정의
 */

/**
 * 맛 선호도 타입
 */
export type TastePreference =
    | '단맛'
    | '짠맛'
    | '신맛'
    | '쓴맛'
    | '매운맛'
    | '고소한맛'
    | '바삭한'
    | '부드러운'
    | '쫄깃한';

/**
 * TPO (Time, Place, Occasion) 컨텍스트
 */
export interface TPOContext {
    time?: '아침' | '점심' | '저녁' | '야식' | '간식시간';
    place?: '집' | '사무실' | '학교' | '야외' | '운동';
    occasion?: '혼자' | '친구와' | '가족과' | '데이트' | '파티';
}

/**
 * 소비 모드
 */
export type ConsumptionMode =
    | '빠른섭취'  // 이동 중, 바쁠 때
    | '천천히'    // 여유있게
    | '나눠먹기'  // 여러 명이
    | '한입크기'; // 간편하게

/**
 * 영양 선호도
 */
export interface NutritionPreference {
    maxCalories?: number;        // 최대 칼로리
    minProtein?: number;          // 최소 단백질
    maxSugar?: number;            // 최대 당류
    maxSodium?: number;           // 최대 나트륨
    preferHighFiber?: boolean;    // 식이섬유 선호
    preferLowFat?: boolean;       // 저지방 선호
}

/**
 * 사용자 선호도 종합
 */
export interface UserPreferences {
    tastes: TastePreference[];             // 선호하는 맛
    tpo?: TPOContext;                       // 현재 TPO
    consumptionMode?: ConsumptionMode;      // 소비 모드
    nutrition?: NutritionPreference;        // 영양 선호도
    avoidCategories?: string[];             // 피하고 싶은 카테고리
    allergies?: string[];                   // 알레르기
}

/**
 * 추천 결과
 */
export interface RecommendationResult {
    snackId: string;
    snackName: string;
    totalScore: number;           // 종합 점수 (0-100)
    scores: {
        nutritionBalance: number;   // 영양 균형 점수
        tasteMatch: number;         // 맛 매칭 점수
        tpoScore: number;           // TPO 적합도 점수
        consumptionMode: number;    // 소비 모드 점수
    };
    matchReasons: string[];       // 추천 이유
}

/**
 * 추천 가중치 설정
 */
export interface RecommendationWeights {
    nutritionBalance: number;     // 영양 균형 가중치 (기본: 0.3)
    tasteMatch: number;           // 맛 매칭 가중치 (기본: 0.4)
    tpoScore: number;             // TPO 가중치 (기본: 0.2)
    consumptionMode: number;      // 소비 모드 가중치 (기본: 0.1)
}

// 기본 가중치
export const DEFAULT_WEIGHTS: RecommendationWeights = {
    nutritionBalance: 0.3,
    tasteMatch: 0.4,
    tpoScore: 0.2,
    consumptionMode: 0.1,
};
