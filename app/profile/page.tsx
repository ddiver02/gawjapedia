'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/lib/hooks/useAuth';

interface UserRating {
    id: string;
    snack_id: string;
    rating: number;
    review: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [myRatings, setMyRatings] = useState<UserRating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchMyRatings();
        }
    }, [user, authLoading]);

    const fetchMyRatings = async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/ratings?user_id=${user.id}`);
            const data = await response.json();

            if (data.success) {
                setMyRatings(data.data.ratings);
            }
        } catch (err) {
            console.error('리뷰 로드 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRating = async (ratingId: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const response = await fetch(`/api/ratings/${ratingId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                alert('리뷰가 삭제되었습니다.');
                fetchMyRatings();
            } else {
                alert('삭제 실패: ' + (data.error?.message || '알 수 없는 오류'));
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
            console.error(err);
        }
    };

    if (authLoading || loading) {
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

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-neutral-50 py-8">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl font-display font-bold mb-8">마이페이지</h1>

                    {/* 사용자 정보 */}
                    <div className="card mb-8">
                        <div className="card-body">
                            <h2 className="text-2xl font-bold mb-4">계정 정보</h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-neutral-600">이메일</span>
                                    <div className="font-semibold">{user.email}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-neutral-600">가입일</span>
                                    <div className="font-semibold">
                                        {new Date(user.created_at || '').toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 내가 작성한 리뷰 */}
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-2xl font-bold mb-4">내가 작성한 리뷰</h2>

                            {myRatings.length === 0 ? (
                                <p className="text-neutral-500 text-center py-8">
                                    아직 작성한 리뷰가 없습니다.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {myRatings.map((rating) => (
                                        <div
                                            key={rating.id}
                                            className="border border-neutral-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="font-semibold mb-1">간식 ID: {rating.snack_id}</div>
                                                    <div className="text-yellow-400">
                                                        {'★'.repeat(rating.rating)}
                                                        {'☆'.repeat(5 - rating.rating)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteRating(rating.id)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    삭제
                                                </button>
                                            </div>

                                            {rating.review && (
                                                <p className="text-neutral-700 mt-2">{rating.review}</p>
                                            )}

                                            <div className="text-xs text-neutral-500 mt-2">
                                                {new Date(rating.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
