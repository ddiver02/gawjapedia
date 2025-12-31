import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchSnacksFromSheet } from '@/lib/googleSheets';
import { recommendSnacks } from '@/lib/recommendation/engine';
import { UserPreferences } from '@/lib/recommendation/types';

/**
 * 요청 본문 검증 스키마
 */
const RecommendationRequestSchema = z.object({
    tastes: z.array(z.string()).optional().default([]),
    tpo: z.object({
        time: z.enum(['아침', '점심', '저녁', '야식', '간식시간']).optional(),
        place: z.enum(['집', '사무실', '학교', '야외', '운동']).optional(),
        occasion: z.enum(['혼자', '친구와', '가족과', '데이트', '파티']).optional(),
    }).optional(),
    consumptionMode: z.enum(['빠른섭취', '천천히', '나눠먹기', '한입크기']).optional(),
    nutrition: z.object({
        maxCalories: z.number().optional(),
        minProtein: z.number().optional(),
        maxSugar: z.number().optional(),
        maxSodium: z.number().optional(),
        preferHighFiber: z.boolean().optional(),
        preferLowFat: z.boolean().optional(),
    }).optional(),
    avoidCategories: z.array(z.string()).optional(),
    limit: z.number().min(1).max(50).optional().default(10),
});

/**
 * POST /api/recommendations
 * 
 * 사용자 선호도 기반 간식 추천
 * 
 * 요청 본문:
 * ```json
 * {
 *   "tastes": ["단맛", "바삭한"],
 *   "tpo": {
 *     "time": "간식시간",
 *     "place": "사무실"
 *   },
 *   "consumptionMode": "빠른섭취",
 *   "nutrition": {
 *     "maxCalories": 300
 *   },
 *   "limit": 10
 * }
 * ```
 * 
 * 응답:
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "recommendations": [
 *       {
 *         "snackId": "1",
 *         "snackName": "초코칩 쿠키",
 *         "totalScore": 85.6,
 *         "scores": {
 *           "nutritionBalance": 75,
 *           "tasteMatch": 90,
 *           "tpoScore": 80,
 *           "consumptionMode": 85
 *         },
 *         "matchReasons": [
 *           "선호하는 맛과 잘 맞아요",
 *           "현재 상황에 딱 맞아요"
 *         ]
 *       }
 *     ],
 *     "totalSnacksEvaluated": 150
 *   }
 * }
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        // 요청 본문 파싱
        const body = await request.json();

        // 검증
        const validationResult = RecommendationRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '잘못된 요청 형식입니다',
                        code: 'VALIDATION_ERROR',
                        details: validationResult.error.errors,
                    },
                },
                { status: 400 }
            );
        }

        const { tastes, tpo, consumptionMode, nutrition, avoidCategories, limit } =
            validationResult.data;

        // 사용자 선호도 객체 생성
        const preferences: UserPreferences = {
            tastes: tastes as any,
            tpo,
            consumptionMode,
            nutrition,
            avoidCategories,
        };

        // 전체 간식 목록 가져오기
        const allSnacks = await fetchSnacksFromSheet();

        // 추천 알고리즘 실행
        const recommendations = recommendSnacks(allSnacks, preferences, undefined, limit);

        return NextResponse.json({
            success: true,
            data: {
                recommendations,
                totalSnacksEvaluated: allSnacks.length,
                preferences: {
                    tastes,
                    tpo,
                    consumptionMode,
                    nutrition,
                },
            },
        });

    } catch (error) {
        console.error('Recommendations API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '추천 생성에 실패했습니다',
                    code: 'RECOMMENDATION_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/recommendations
 * 
 * 쿼리 파라미터로 간단한 추천
 * 
 * @example
 * GET /api/recommendations?tastes=단맛,바삭한&time=간식시간&limit=5
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const tastesParam = searchParams.get('tastes');
        const tastes = tastesParam ? tastesParam.split(',') : [];
        const time = searchParams.get('time');
        const place = searchParams.get('place');
        const limit = parseInt(searchParams.get('limit') || '10');

        const preferences: UserPreferences = {
            tastes: tastes as any,
            tpo: time || place ? {
                time: time as any,
                place: place as any,
            } : undefined,
        };

        const allSnacks = await fetchSnacksFromSheet();
        const recommendations = recommendSnacks(allSnacks, preferences, undefined, limit);

        return NextResponse.json({
            success: true,
            data: {
                recommendations,
                totalSnacksEvaluated: allSnacks.length,
            },
        });

    } catch (error) {
        console.error('Recommendations GET API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '추천 생성에 실패했습니다',
                    code: 'RECOMMENDATION_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
