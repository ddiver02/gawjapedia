'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Snack } from '@/types/snack';
import { useAuth } from '@/lib/hooks/useAuth';

interface Rating {
    id: string;
    rating: number;
    review: string | null;
    created_at: string;
    profiles: {
        username: string | null;
        full_name: string | null;
    };
}

export default function SnackDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();

    const [snack, setSnack] = useState<Snack | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 리뷰 작성
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newReview, setNewReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSnackDetail();
    }, [id]);

    const fetchSnackDetail = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/snacks/${id}`);
            const data = await response.json();

            if (data.success) {
                setSnack(data.data.snack);
                setAvgRating(data.data.ratings.averageRating || 0);
                setTotalRatings(data.data.ratings.totalRatings || 0);
                setRatings(data.data.recentReviews || []);
            } else {
                setError('간식 정보를 찾을 수 없습니다.');
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    snackId: id,
                    rating: newRating,
                    review: newReview || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('리뷰가 등록되었습니다!');
                setShowReviewForm(false);
                setNewRating(5);
                setNewReview('');
                fetchSnackDetail();
            } else {
                alert(data.error?.message || '리뷰 등록에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="spinner"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !snack) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 text-lg mb-4">{error}</p>
                        <Link href="/snacks" className="btn btn-primary">
                            간식 목록으로
                        </Link>
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
                    {/* 뒤로 가기 */}
                    <Link href="/snacks" className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        목록으로
                    </Link>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* 왼쪽: 기본 정보 */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="badge badge-primary">{snack.category}</span>
                                                <span className="badge bg-yellow-100 text-yellow-800 border-yellow-300">
                                                    ⭐ 평가: {snack.rating.toFixed(1)}/5
                                                </span>
                                            </div>
                                            <h1 className="text-3xl font-display font-bold mb-2">{snack.name}</h1>
                                            <p className="text-neutral-600">{snack.manufacturer}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary-600">{avgRating.toFixed(1)}⭐</div>
                                            <div className="text-sm text-neutral-500">{totalRatings}개 평가</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm">
                                        <span><strong>내용량:</strong> {snack.contentVolume}</span>
                                        <span><strong>가격:</strong> {snack.price.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>

                            {/* 영양 정보 */}
                            <div className="card">
                                <div className="card-body">
                                    <h2 className="text-2xl font-bold mb-4">영양 정보</h2>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-neutral-50 p-4 rounded-lg">
                                            <div className="text-sm text-neutral-600">열량</div>
                                            <div className="text-lg font-bold">{snack.nutrition.calories} kcal</div>
                                        </div>
                                        <div className="bg-neutral-50 p-4 rounded-lg">
                                            <div className="text-sm text-neutral-600">탄수화물</div>
                                            <div className="text-lg font-bold">{snack.nutrition.carbohydrate} g</div>
                                        </div>
                                        <div className="bg-neutral-50 p-4 rounded-lg">
                                            <div className="text-sm text-neutral-600">단백질</div>
                                            <div className="text-lg font-bold">{snack.nutrition.protein} g</div>
                                        </div>
                                        <div className="bg-neutral-50 p-4 rounded-lg">
                                            <div className="text-sm text-neutral-600">지방</div>
                                            <div className="text-lg font-bold">{snack.nutrition.fat} g</div>
                                        </div>
                                        <div className="bg-neutral-50 p-4 rounded-lg">
                                            <div className="text-sm text-neutral-600">당류</div>
                                            <div className="text-lg font-bold">{snack.nutrition.sugars} g</div>
                                        </div>
                                        <div className="bg-neutral-50 p-4 rounded-lg">
                                            <div className="text-sm text-neutral-600">나트륨</div>
                                            <div className="text-lg font-bold">{snack.nutrition.sodium} mg</div>
                                        </div>
                                    </div>

                                    <details className="mt-4">
                                        <summary className="cursor-pointer text-primary-600 font-semibold">
                                            상세 영양 정보 보기
                                        </summary>
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div>식이섬유: {snack.nutrition.dietaryFiber}g</div>
                                            <div>포화지방: {snack.nutrition.saturatedFat}g</div>
                                            <div>트랜스지방: {snack.nutrition.transFat}g</div>
                                            <div>콜레스테롤: {snack.nutrition.cholesterol}mg</div>
                                            <div>칼슘: {snack.nutrition.calcium}mg</div>
                                            <div>철분: {snack.nutrition.iron}mg</div>
                                            <div>비타민C: {snack.nutrition.vitaminC}mg</div>
                                            <div>비타민E: {snack.nutrition.vitaminE}mg</div>
                                        </div>
                                    </details>
                                </div>
                            </div>

                            {/* 리뷰 섹션 */}
                            <div className="card">
                                <div className="card-body">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold">리뷰</h2>
                                        {user && (
                                            <button
                                                onClick={() => setShowReviewForm(!showReviewForm)}
                                                className="btn btn-primary"
                                            >
                                                리뷰 작성
                                            </button>
                                        )}
                                    </div>

                                    {showReviewForm && (
                                        <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-neutral-50 rounded-lg">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium mb-2">평점</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setNewRating(star)}
                                                            className={`text-2xl ${star <= newRating ? 'text-yellow-400' : 'text-neutral-300'}`}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium mb-2">리뷰 (선택)</label>
                                                <textarea
                                                    value={newReview}
                                                    onChange={(e) => setNewReview(e.target.value)}
                                                    className="input"
                                                    rows={3}
                                                    placeholder="이 간식에 대한 생각을 알려주세요..."
                                                />
                                            </div>
                                            <button type="submit" disabled={submitting} className="btn btn-primary">
                                                {submitting ? '등록 중...' : '리뷰 등록'}
                                            </button>
                                        </form>
                                    )}

                                    {ratings.length === 0 ? (
                                        <p className="text-neutral-500 text-center py-8">아직 리뷰가 없습니다.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {ratings.map((rating) => (
                                                <div key={rating.id} className="border-b border-neutral-200 pb-4 last:border-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="font-semibold">
                                                            {rating.profiles.username || rating.profiles.full_name || '익명'}
                                                        </div>
                                                        <div className="text-yellow-400">
                                                            {'★'.repeat(rating.rating)}
                                                            {'☆'.repeat(5 - rating.rating)}
                                                        </div>
                                                    </div>
                                                    {rating.review && (
                                                        <p className="text-neutral-700">{rating.review}</p>
                                                    )}
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        {new Date(rating.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: 액션 */}
                        <div className="space-y-6">
                            <div className="card sticky top-24">
                                <div className="card-body">
                                    <h3 className="font-bold text-lg mb-4">추천 받기</h3>
                                    <p className="text-sm text-neutral-600 mb-4">
                                        이 간식과 비슷한 다른 간식을 찾아보세요!
                                    </p>
                                    <Link href="/recommendations" className="btn btn-primary w-full">
                                        추천 받기
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
