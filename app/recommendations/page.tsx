'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { RecommendationResult } from '@/lib/recommendation/types';

export default function RecommendationsPage() {
    const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [preferences, setPreferences] = useState<any>(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError('');

        try {
            // localStorage에서 선호도 가져오기
            const savedPrefs = localStorage.getItem('userPreferences');
            const prefs = savedPrefs ? JSON.parse(savedPrefs) : {
                tastes: [],
                tpo: {},
                nutrition: {},
            };

            setPreferences(prefs);

            // API 호출
            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prefs),
            });

            const data = await response.json();

            if (data.success) {
                setRecommendations(data.data.recommendations);
            } else {
                setError(data.error?.message || '추천을 불러오는 데 실패했습니다.');
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner mb-4"></div>
                        <p className="text-neutral-600">맞춤 추천을 생성하고 있습니다...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-neutral-50 py-8">
                <div className="container">
                    <div className="mb-8">
                        <h1 className="text-4xl font-display font-bold mb-4">
                            당신을 위한 추천 간식
                        </h1>
                        {preferences && (
                            <div className="flex flex-wrap gap-2">
                                {preferences.tastes?.map((taste: string) => (
                                    <span key={taste} className="badge badge-primary">
                                        {taste}
                                    </span>
                                ))}
                                {preferences.tpo?.time && (
                                    <span className="badge badge-secondary">
                                        {preferences.tpo.time}
                                    </span>
                                )}
                                {preferences.tpo?.place && (
                                    <span className="badge badge-secondary">
                                        {preferences.tpo.place}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                            {error}
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="card">
                            <div className="card-body text-center py-12">
                                <p className="text-neutral-600 mb-4">
                                    추천할 간식이 없습니다. 취향 테스트를 먼저 진행해주세요.
                                </p>
                                <Link href="/test" className="btn btn-primary">
                                    취향 테스트 하기
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recommendations.map((rec, index) => (
                                <div key={rec.snackId} className="card hover:shadow-lg transition-shadow">
                                    <div className="card-body">
                                        <div className="flex items-start gap-6">
                                            {/* 순위 */}
                                            <div className="flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                        index === 1 ? 'bg-gray-300 text-gray-700' :
                                                            index === 2 ? 'bg-amber-600 text-white' :
                                                                'bg-neutral-200 text-neutral-600'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </div>

                                            {/* 간식 정보 */}
                                            <div className="flex-1">
                                                <Link
                                                    href={`/snacks/${rec.snackId}`}
                                                    className="text-2xl font-bold hover:text-primary-600 transition-colors"
                                                >
                                                    {rec.snackName}
                                                </Link>

                                                {/* 추천 이유 */}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {rec.matchReasons.map((reason, i) => (
                                                        <span key={i} className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
                                                            {reason}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* 점수 상세 */}
                                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <div className="text-xs text-neutral-500">영양 균형</div>
                                                        <div className="text-lg font-semibold text-secondary-600">
                                                            {rec.scores.nutritionBalance}점
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-neutral-500">맛 매칭</div>
                                                        <div className="text-lg font-semibold text-primary-600">
                                                            {rec.scores.tasteMatch}점
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-neutral-500">상황 적합</div>
                                                        <div className="text-lg font-semibold text-primary-600">
                                                            {rec.scores.tpoScore}점
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-neutral-500">소비 방식</div>
                                                        <div className="text-lg font-semibold text-neutral-600">
                                                            {rec.scores.consumptionMode}점
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 총점 */}
                                            <div className="flex-shrink-0 text-right">
                                                <div className="text-sm text-neutral-500">총점</div>
                                                <div className="text-3xl font-bold text-primary-600">
                                                    {rec.totalScore.toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 재검색 버튼 */}
                    <div className="mt-8 text-center">
                        <Link href="/test" className="btn btn-outline">
                            다시 테스트하기
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
