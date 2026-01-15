import type { NutritionInfo, Product } from '@/types/product';
import type { TPOContext, ConsumptionMode, NutritionPreference, TastePreference } from './types';

/**
 * 영양 균형 점수 계산 (0-100)
 * 
 * 다음 요소를 평가합니다:
 * 1. 칼로리 적정성
 * 2. 영양소 균형 (단백질, 탄수화물, 지방 비율)
 * 3. 비타민/미네랄 함량
 * 4. 과다 영양소 (당, 나트륨, 포화지방) 페널티
 * 
 * @param nutrition - 간식의 영양 정보
 * @param preferences - 사용자 영양 선호도 (선택)
 * @returns 영양 점수 (0-100)
 */
export function calculateNutritionScore(
    nutrition: NutritionInfo,
    preferences?: NutritionPreference
): number {
    let score = 50; // 기본 점수
    const reasons: string[] = [];

    // 1. 칼로리 평가
    if (preferences?.maxCalories) {
        if (nutrition.calories <= preferences.maxCalories) {
            score += 15;
            reasons.push('칼로리 적정');
        } else {
            const excess = nutrition.calories - preferences.maxCalories;
            score -= Math.min(excess / 50, 15); // 초과분에 따라 감점
        }
    } else {
        // 기본 칼로리 평가 (100-300kcal이 적정)
        if (nutrition.calories >= 100 && nutrition.calories <= 300) {
            score += 10;
        } else if (nutrition.calories > 500) {
            score -= 10;
        }
    }

    // 2. 단백질 평가
    if (preferences?.minProtein) {
        if (nutrition.protein >= preferences.minProtein) {
            score += 10;
            reasons.push('단백질 풍부');
        }
    } else {
        // 단백질 3g 이상이면 가점
        if (nutrition.protein >= 3) {
            score += 5;
        }
    }

    // 3. 식이섬유 평가
    if (preferences?.preferHighFiber && nutrition.dietaryFiber >= 2) {
        score += 10;
        reasons.push('식이섬유 풍부');
    } else if (nutrition.dietaryFiber >= 3) {
        score += 5;
    }

    // 4. 당류 평가
    if (preferences?.maxSugar) {
        if (nutrition.sugars <= preferences.maxSugar) {
            score += 10;
        } else {
            score -= 10;
        }
    } else {
        // 당류 20g 초과 시 감점
        if (nutrition.sugars > 20) {
            score -= 10;
        }
    }

    // 5. 나트륨 평가
    if (preferences?.maxSodium) {
        if (nutrition.sodium <= preferences.maxSodium) {
            score += 10;
        } else {
            score -= 10;
        }
    } else {
        // 나트륨 500mg 초과 시 감점
        if (nutrition.sodium > 500) {
            score -= 10;
        }
    }

    // 6. 지방 평가
    if (preferences?.preferLowFat) {
        if (nutrition.fat <= 5) {
            score += 10;
            reasons.push('저지방');
        }
    }

    // 트랜스지방 0이면 가점
    if (nutrition.transFat === 0) {
        score += 5;
    }

    // 7. 비타민/미네랄 보너스
    let vitaminScore = 0;
    if (nutrition.vitaminC > 0) vitaminScore += 2;
    if (nutrition.vitaminE > 0) vitaminScore += 2;
    if (nutrition.calcium > 50) vitaminScore += 2;
    if (nutrition.iron > 1) vitaminScore += 2;
    score += Math.min(vitaminScore, 10);

    // 점수 범위: 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * 맛 매칭 점수 계산 (0-100)
 * 
 * 간식의 카테고리와 특성을 사용자 맛 선호도와 비교합니다
 * 
 * @param snack - 간식 정보
 * @param preferences - 사용자 선호 맛 목록
 * @returns 맛 매칭 점수 (0-100)
 */
export function calculateTasteMatchScore(
    snack: Product,
    preferences: TastePreference[]
): number {
    if (preferences.length === 0) {
        return 50; // 선호도 없으면 중립
    }

    let matchScore = 0;
    const matchedTastes: string[] = [];

    // 카테고리별 맛 특성 매핑
    const categoryTasteMap: Record<string, TastePreference[]> = {
        '과자': ['짠맛', '바삭한', '고소한맛'],
        '초콜릿': ['단맛', '부드러운', '쓴맛'],
        '캔디': ['단맛', '신맛'],
        '젤리': ['단맛', '쫄깃한', '신맛'],
        '건과류': ['고소한맛', '바삭한'],
        '아이스크림': ['단맛', '부드러운'],
    };

    const snackTastes = categoryTasteMap[snack.category] || [];

    // 매칭되는 맛 카운트
    preferences.forEach(pref => {
        if (snackTastes.includes(pref)) {
            matchScore += (100 / preferences.length);
            matchedTastes.push(pref);
        }
    });

    // 영양성분 기반 맛 추론
    // 단맛: 당류가 높으면
    if (preferences.includes('단맛') && snack.nutrition.sugars > 10) {
        matchScore += 20;
    }

    // 짠맛: 나트륨이 높으면
    if (preferences.includes('짠맛') && snack.nutrition.sodium > 200) {
        matchScore += 20;
    }

    // 고소한맛: 지방이 적당하면
    if (preferences.includes('고소한맛') && snack.nutrition.fat > 10) {
        matchScore += 20;
    }

    return Math.min(100, matchScore);
}

/**
 * TPO (Time, Place, Occasion) 점수 계산 (0-100)
 * 
 * 현재 상황(시간, 장소, 행사)에 간식이 얼마나 적합한지 평가
 * 
 * @param snack - 간식 정보
 * @param tpo - TPO 컨텍스트
 * @returns TPO 적합도 점수 (0-100)
 */
export function calculateTPOScore(snack: Product, tpo?: TPOContext): number {
    if (!tpo) {
        return 50; // TPO 정보 없으면 중립
    }

    let score = 50;

    // 시간대별 추천
    if (tpo.time) {
        switch (tpo.time) {
            case '아침':
                // 아침: 가볍고 칼로리 적당한
                if (snack.nutrition.calories < 200) score += 15;
                if (snack.nutrition.protein > 3) score += 10;
                break;
            case '점심':
            case '저녁':
                // 식사 대용: 단백질, 식이섬유 풍부
                if (snack.nutrition.protein > 5) score += 10;
                if (snack.nutrition.dietaryFiber > 2) score += 10;
                break;
            case '야식':
                // 야식: 저칼로리, 소화 잘 되는
                if (snack.nutrition.calories < 150) score += 20;
                if (snack.nutrition.fat < 5) score += 10;
                break;
            case '간식시간':
                // 간식: 당 적당, 맛있는
                if (snack.nutrition.sugars > 5 && snack.nutrition.sugars < 20) score += 15;
                break;
        }
    }

    // 장소별 추천
    if (tpo.place) {
        switch (tpo.place) {
            case '사무실':
            case '학교':
                // 깔끔하게 먹을 수 있는
                if (['과자', '캔디', '초콜릿'].includes(snack.category)) score += 10;
                break;
            case '야외':
            case '운동':
                // 휴대 간편, 에너지 충전
                if (snack.nutrition.carbohydrate > 20) score += 10;
                if (snack.nutrition.protein > 5) score += 10;
                break;
            case '집':
                // 제한 없음
                score += 5;
                break;
        }
    }

    // 행사별 추천
    if (tpo.occasion) {
        switch (tpo.occasion) {
            case '파티':
            case '친구와':
                // 나눠먹기 좋은, 큰 용량
                if (parseInt(snack.contentVolume) > 100) score += 15;
                break;
            case '혼자':
                // 적당한 용량, 개별 포장
                if (parseInt(snack.contentVolume) <= 100) score += 10;
                break;
            case '데이트':
                // 깔끔한, 프리미엄
                if (snack.price > 2000) score += 10;
                if (['초콜릿', '캔디'].includes(snack.category)) score += 10;
                break;
        }
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * 소비 모드 점수 계산 (0-100)
 * 
 * 소비 방식에 따른 간식 적합도 평가
 * 
 * @param snack - 간식 정보
 * @param mode - 소비 모드
 * @returns 소비 모드 점수 (0-100)
 */
export function calculateConsumptionModeScore(
    snack: Product,
    mode?: ConsumptionMode
): number {
    if (!mode) {
        return 50;
    }

    let score = 50;

    switch (mode) {
        case '빠른섭취':
            // 간편하게 먹을 수 있는
            if (['캔디', '초콜릿'].includes(snack.category)) score += 30;
            if (parseInt(snack.contentVolume) <= 50) score += 20;
            break;
        case '천천히':
            // 오래 즐길 수 있는
            if (['과자', '건과류'].includes(snack.category)) score += 30;
            break;
        case '나눠먹기':
            // 큰 용량, 나누기 좋은
            if (parseInt(snack.contentVolume) > 100) score += 40;
            if (['과자', '젤리'].includes(snack.category)) score += 10;
            break;
        case '한입크기':
            // 작고 간편한
            if (['캔디', '초콜릿', '젤리'].includes(snack.category)) score += 40;
            if (parseInt(snack.contentVolume) <= 30) score += 10;
            break;
    }

    return Math.max(0, Math.min(100, score));
}
