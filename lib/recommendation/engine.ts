import { Snack } from '@/types/snack';
import {
    UserPreferences,
    RecommendationResult,
    RecommendationWeights,
    DEFAULT_WEIGHTS,
} from './types';
import {
    calculateNutritionScore,
    calculateTasteMatchScore,
    calculateTPOScore,
    calculateConsumptionModeScore,
} from './scoring';

/**
 * 간식 추천 엔진
 * 
 * 사용자 선호도와 가중치를 기반으로 간식 목록을 평가하고
 * 최적의 추천 결과를 반환합니다
 * 
 * 추천 알고리즘:
 * totalScore = w1 * nutritionScore + w2 * tasteScore + w3 * tpoScore + w4 * consumptionScore
 * 
 * @param snacks - 전체 간식 목록
 * @param preferences - 사용자 선호도
 * @param weights - 가중치 설정 (선택, 기본값 사용)
 * @param limit - 반환할 최대 결과 수 (기본: 10)
 * @returns 추천 결과 배열 (점수 높은 순)
 * 
 * @example
 * ```typescript
 * const userPrefs: UserPreferences = {
 *   tastes: ['단맛', '바삭한'],
 *   tpo: { time: '간식시간', place: '사무실' },
 *   consumptionMode: '빠른섭취',
 *   nutrition: { maxCalories: 300 },
 * };
 * 
 * const recommendations = await recommendSnacks(allSnacks, userPrefs);
 * console.log(`추천 1순위: ${recommendations[0].snackName} (점수: ${recommendations[0].totalScore})`);
 * ```
 */
export function recommendSnacks(
    snacks: Snack[],
    preferences: UserPreferences,
    weights: RecommendationWeights = DEFAULT_WEIGHTS,
    limit: number = 10
): RecommendationResult[] {

    // 1. 필터링: 피해야 할 카테고리 제외
    let filteredSnacks = snacks;

    if (preferences.avoidCategories && preferences.avoidCategories.length > 0) {
        filteredSnacks = filteredSnacks.filter(
            snack => !preferences.avoidCategories!.includes(snack.category)
        );
    }

    // 2. 각 간식에 대해 점수 계산
    const scoredSnacks: RecommendationResult[] = filteredSnacks.map(snack => {
        // 개별 점수 계산
        const nutritionScore = calculateNutritionScore(
            snack.nutrition,
            preferences.nutrition
        );

        const tasteScore = calculateTasteMatchScore(
            snack,
            preferences.tastes
        );

        const tpoScore = calculateTPOScore(
            snack,
            preferences.tpo
        );

        const consumptionScore = calculateConsumptionModeScore(
            snack,
            preferences.consumptionMode
        );

        // 가중 평균으로 총점 계산
        const totalScore =
            weights.nutritionBalance * nutritionScore +
            weights.tasteMatch * tasteScore +
            weights.tpoScore * tpoScore +
            weights.consumptionMode * consumptionScore;

        // 추천 이유 생성
        const matchReasons: string[] = [];

        if (tasteScore > 70) {
            matchReasons.push('선호하는 맛과 잘 맞아요');
        }

        if (nutritionScore > 70) {
            matchReasons.push('영양 균형이 좋아요');
        }

        if (tpoScore > 70) {
            matchReasons.push('현재 상황에 딱 맞아요');
        }

        if (snack.score >= 8) {
            matchReasons.push(`높은 평점 (${snack.score}/10)`);
        }

        if (preferences.nutrition?.maxCalories &&
            snack.nutrition.calories <= preferences.nutrition.maxCalories) {
            matchReasons.push(`칼로리 ${snack.nutrition.calories}kcal`);
        }

        if (snack.nutrition.protein > 5) {
            matchReasons.push(`단백질 풍부 (${snack.nutrition.protein}g)`);
        }

        if (snack.nutrition.dietaryFiber > 3) {
            matchReasons.push('식이섬유 풍부');
        }

        return {
            snackId: snack.id,
            snackName: snack.name,
            totalScore: Math.round(totalScore * 100) / 100,
            scores: {
                nutritionBalance: Math.round(nutritionScore),
                tasteMatch: Math.round(tasteScore),
                tpoScore: Math.round(tpoScore),
                consumptionMode: Math.round(consumptionScore),
            },
            matchReasons,
        };
    });

    // 3. 점수 높은 순으로 정렬
    const sorted = scoredSnacks.sort((a, b) => b.totalScore - a.totalScore);

    // 4. 상위 N개 반환
    return sorted.slice(0, limit);
}

/**
 * 간단 추천: 맛 선호도만으로 추천
 * 
 * @param snacks - 전체 간식 목록
 * @param tastes - 선호 맛 목록
 * @param limit - 반환할 최대 결과 수
 */
export function recommendByTaste(
    snacks: Snack[],
    tastes: string[],
    limit: number = 5
): RecommendationResult[] {
    const preferences: UserPreferences = {
        tastes: tastes as any,
    };

    // 맛 가중치를 높게 설정
    const weights: RecommendationWeights = {
        nutritionBalance: 0.2,
        tasteMatch: 0.6,
        tpoScore: 0.1,
        consumptionMode: 0.1,
    };

    return recommendSnacks(snacks, preferences, weights, limit);
}

/**
 * 건강 중심 추천: 영양성분 기준으로 추천
 * 
 * @param snacks - 전체 간식 목록
 * @param maxCalories - 최대 칼로리
 * @param limit - 반환할 최대 결과 수
 */
export function recommendHealthy(
    snacks: Snack[],
    maxCalories: number = 200,
    limit: number = 5
): RecommendationResult[] {
    const preferences: UserPreferences = {
        tastes: [],
        nutrition: {
            maxCalories,
            maxSugar: 10,
            maxSodium: 300,
            preferHighFiber: true,
            preferLowFat: true,
        },
    };

    // 영양 가중치를 높게 설정
    const weights: RecommendationWeights = {
        nutritionBalance: 0.7,
        tasteMatch: 0.1,
        tpoScore: 0.1,
        consumptionMode: 0.1,
    };

    return recommendSnacks(snacks, preferences, weights, limit);
}

/**
 * 상황별 추천: TPO 기준으로 추천
 * 
 * @param snacks - 전체 간식 목록
 * @param time - 시간대
 * @param place - 장소
 * @param limit - 반환할 최대 결과 수
 */
export function recommendByContext(
    snacks: Snack[],
    time?: string,
    place?: string,
    limit: number = 5
): RecommendationResult[] {
    const preferences: UserPreferences = {
        tastes: [],
        tpo: {
            time: time as any,
            place: place as any,
        },
    };

    // TPO 가중치를 높게 설정
    const weights: RecommendationWeights = {
        nutritionBalance: 0.2,
        tasteMatch: 0.2,
        tpoScore: 0.5,
        consumptionMode: 0.1,
    };

    return recommendSnacks(snacks, preferences, weights, limit);
}

/**
 * 유사 간식 찾기
 * 특정 간식과 비슷한 영양성분/카테고리를 가진 간식 추천
 * 
 * @param snacks - 전체 간식 목록
 * @param targetSnack - 기준 간식
 * @param limit - 반환할 최대 결과 수
 */
export function findSimilarSnacks(
    snacks: Snack[],
    targetSnack: Snack,
    limit: number = 5
): Snack[] {
    // 자기 자신 제외
    const otherSnacks = snacks.filter(s => s.id !== targetSnack.id);

    // 유사도 계산
    const scored = otherSnacks.map(snack => {
        let similarity = 0;

        // 같은 카테고리면 가점
        if (snack.category === targetSnack.category) {
            similarity += 30;
        }

        // 칼로리 차이
        const calorieDiff = Math.abs(snack.nutrition.calories - targetSnack.nutrition.calories);
        similarity += Math.max(0, 20 - calorieDiff / 10);

        // 단백질 유사도
        const proteinDiff = Math.abs(snack.nutrition.protein - targetSnack.nutrition.protein);
        similarity += Math.max(0, 10 - proteinDiff);

        // 당류 유사도
        const sugarDiff = Math.abs(snack.nutrition.sugars - targetSnack.nutrition.sugars);
        similarity += Math.max(0, 10 - sugarDiff / 2);

        // 가격대 유사도
        const priceDiff = Math.abs(snack.price - targetSnack.price);
        similarity += Math.max(0, 10 - priceDiff / 200);

        return { snack, similarity };
    });

    // 유사도 높은 순 정렬
    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit).map(item => item.snack);
}
