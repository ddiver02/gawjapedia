'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Product } from '@/types/product';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProductComment {
    comment_id: string;
    comment: string;
    agree: number;
    disagree: number;
    created_at: string;
    user_id: string;
}

export default function SnackDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [comments, setComments] = useState<ProductComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 이중 평점 작성
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [priceRating, setPriceRating] = useState(3);
    const [qualityRating, setQualityRating] = useState(3);
    const [submitting, setSubmitting] = useState(false);

    // 댓글 작성
    const [newComment, setNewComment] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    useEffect(() => {
        fetchProductDetail();
    }, [id]);

    const fetchProductDetail = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/products/${id}`);
            const data = await response.json();

            if (data.success) {
                setProduct(data.data.product);
                setComments(data.data.comments || []);
            } else {
                setError('제품 정보를 찾을 수 없습니다.');
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRating = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/products/${id}/ratings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceRating, qualityRating }),
            });

            const data = await response.json();

            if (data.success) {
                alert('평점이 저장되었습니다!');
                setShowRatingForm(false);
                fetchProductDetail(); // 새로고침
            } else {
                alert(data.error.message || '평점 저장에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!newComment.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        setCommentSubmitting(true);
        try {
            const response = await fetch(`/api/products/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: newComment }),
            });

            const data = await response.json();

            if (data.success) {
                setNewComment('');
                fetchProductDetail(); // 새로고침
            } else {
                alert(data.error.message || '댓글 작성에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            const response = await fetch(`/api/products/${id}/comments?comment_id=${commentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                fetchProductDetail(); // 새로고침
            } else {
                alert(data.error.message || '댓글 삭제에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
            console.error(err);
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

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">{error || '제품을 찾을 수 없습니다'}</h2>
                        <Link href="/snacks" className="btn btn-primary">
                            목록으로 돌아가기
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

            <main className="flex-1 bg-neutral-50">
                <div className="container py-8">
                    {/* 뒤로 가기 */}
                    <Link href="/snacks" className="inline-flex items-center text-neutral-600 hover:text-primary-600 mb-6">
                        ← 목록으로 돌아가기
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* 왼쪽: 제품 기본 정보 */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                {/* 헤더 */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <span className="badge badge-primary mb-2">{product.category}</span>
                                        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                                        <p className="text-lg text-neutral-600">{product.manufacturer}</p>
                                    </div>
                                </div>

                                {/* 사용자 평가 (5점 만점 이중 평점) */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg">⭐ 사용자 평가</h3>
                                        {user && (
                                            <button
                                                onClick={() => setShowRatingForm(!showRatingForm)}
                                                className="btn btn-sm btn-primary"
                                            >
                                                평가하기
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {/* 가격 평점 */}
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="text-sm text-neutral-600 mb-1">가격 대비 만족도</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {product.avgPriceRating?.toFixed(1) || '0.0'}
                                                </span>
                                                <span className="text-blue-400">★</span>
                                            </div>
                                        </div>

                                        {/* 품질 평점 */}
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="text-sm text-neutral-600 mb-1">맛/품질 만족도</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {product.avgQualityRating?.toFixed(1) || '0.0'}
                                                </span>
                                                <span className="text-blue-400">★</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-neutral-600">
                                        총 {product.totalRatings || 0}명이 평가했습니다
                                    </p>

                                    {/* 평점 입력 폼 */}
                                    {showRatingForm && (
                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                            <div className="space-y-4">
                                                {/* 가격 평점 */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        가격 대비 만족도 (1-5)
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        {[1, 2, 3, 4, 5].map((value) => (
                                                            <button
                                                                key={value}
                                                                onClick={() => setPriceRating(value)}
                                                                className={`text-3xl ${value <= priceRating ? 'text-blue-400' : 'text-neutral-300'}`}
                                                            >
                                                                ★
                                                            </button>
                                                        ))}
                                                        <span className="ml-2 text-lg font-bold">{priceRating}</span>
                                                    </div>
                                                </div>

                                                {/* 품질 평점 */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        맛/품질 만족도 (1-5)
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        {[1, 2, 3, 4, 5].map((value) => (
                                                            <button
                                                                key={value}
                                                                onClick={() => setQualityRating(value)}
                                                                className={`text-3xl ${value <= qualityRating ? 'text-blue-400' : 'text-neutral-300'}`}
                                                            >
                                                                ★
                                                            </button>
                                                        ))}
                                                        <span className="ml-2 text-lg font-bold">{qualityRating}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleSubmitRating}
                                                    disabled={submitting}
                                                    className="btn btn-primary w-full"
                                                >
                                                    {submitting ? '저장 중...' : '평점 저장'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 설명 */}
                                {product.description && (
                                    <div className="mb-6">
                                        <h3 className="font-bold text-lg mb-3">제품 설명</h3>
                                        <p className="text-neutral-700">{product.description}</p>
                                    </div>
                                )}

                                {/* 영양 정보 */}
                                <div>
                                    <h3 className="font-bold text-lg mb-4">영양 정보</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-neutral-50 rounded-lg p-4">
                                            <div className="text-sm text-neutral-600">열량</div>
                                            <div className="text-lg font-bold">{product.nutrition.calories} kcal</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded-lg p-4">
                                            <div className="text-sm text-neutral-600">탄수화물</div>
                                            <div className="text-lg font-bold">{product.nutrition.carbohydrate} g</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded-lg p-4">
                                            <div className="text-sm text-neutral-600">단백질</div>
                                            <div className="text-lg font-bold">{product.nutrition.protein} g</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded-lg p-4">
                                            <div className="text-sm text-neutral-600">지방</div>
                                            <div className="text-lg font-bold">{product.nutrition.fat} g</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded-lg p-4">
                                            <div className="text-sm text-neutral-600">나트륨</div>
                                            <div className="text-lg font-bold">{product.nutrition.sodium} mg</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded-lg p-4">
                                            <div className="text-sm text-neutral-600">당류</div>
                                            <div className="text-lg font-bold">{product.nutrition.sugars} g</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 댓글 섹션 */}
                                <div className="mt-8">
                                    <h3 className="font-bold text-lg mb-4">사용자 댓글 ({comments.length})</h3>

                                    {/* 댓글 작성 폼 */}
                                    {user ? (
                                        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="댓글을 작성해주세요..."
                                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                                rows={3}
                                                maxLength={500}
                                            />
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-neutral-500">
                                                    {newComment.length}/500
                                                </span>
                                                <button
                                                    onClick={handleSubmitComment}
                                                    disabled={commentSubmitting || !newComment.trim()}
                                                    className="btn btn-primary btn-sm disabled:opacity-50"
                                                >
                                                    {commentSubmitting ? '작성 중...' : '댓글 작성'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-neutral-50 rounded-lg p-6 text-center mb-6">
                                            <p className="text-neutral-600 mb-2">로그인하고 댓글을 작성해보세요</p>
                                            <Link href="/login" className="text-primary-600 hover:underline">
                                                로그인하기
                                            </Link>
                                        </div>
                                    )}

                                    {/* 댓글 목록 */}
                                    {comments.length === 0 ? (
                                        <p className="text-center text-neutral-500 py-8">
                                            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {comments.map((comment) => (
                                                <div
                                                    key={comment.comment_id}
                                                    className="bg-white border border-neutral-200 rounded-lg p-4"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <p className="text-neutral-700">{comment.comment}</p>
                                                        </div>
                                                        {user?.id === comment.user_id && (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.comment_id)}
                                                                className="text-sm text-red-600 hover:text-red-700 ml-4"
                                                            >
                                                                삭제
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                        {new Date(comment.created_at).toLocaleString('ko-KR')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: 제품 상세 */}
                        <div>
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                                <h3 className="font-bold text-lg mb-4">제품 정보</h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm text-neutral-600">가격</dt>
                                        <dd className="text-2xl font-bold text-primary-600">
                                            {product.price.toLocaleString()}원
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-neutral-600">내용량</dt>
                                        <dd className="font-medium">{product.contentVolume}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-neutral-600">제조사</dt>
                                        <dd className="font-medium">{product.manufacturer}</dd>
                                    </div>
                                    {product.maker && (
                                        <div>
                                            <dt className="text-sm text-neutral-600">제조원</dt>
                                            <dd className="font-medium">{product.maker}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
