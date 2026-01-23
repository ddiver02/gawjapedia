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
                fetchProductDetail();
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
                fetchProductDetail();
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
                fetchProductDetail();
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

    const avgRating = product.avgPriceRating && product.avgQualityRating
        ? ((product.avgPriceRating + product.avgQualityRating) / 2).toFixed(1)
        : '0.0';

    return (
        <div className="min-h-screen flex flex-col bg-neutral-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative h-96 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
                    {/* Background blur effect */}
                    <div className="absolute inset-0 bg-primary-100/30 backdrop-blur-sm" />

                    {/* Content */}
                    <div className="relative container h-full flex items-center gap-8 py-8">
                        {/* Product Image */}
                        <div className="w-56 h-72 rounded-lg shadow-2xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                            <span className="text-8xl">🥨</span>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                            <span className="inline-block px-3 py-1 bg-white rounded-full text-sm font-medium text-primary-600 mb-3">
                                {product.category}
                            </span>
                            <h1 className="text-5xl font-bold text-neutral-900 mb-2">{product.title}</h1>
                            <p className="text-xl text-neutral-700 mb-6">{product.manufacturer}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary-600 text-3xl font-bold">평균 ★{avgRating}</span>
                                    <span className="text-lg text-neutral-600">({product.totalRatings || 0}명)</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRatingForm(!showRatingForm)}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                >
                                    ⭐ 평점 남기기
                                </button>
                                <button
                                    onClick={() => document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-6 py-3 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                                >
                                    💬 댓글 작성
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Centered Layout */}
                <div className="container max-w-4xl py-8">
                    {/* Back Button */}
                    <Link href="/snacks" className="inline-flex items-center text-neutral-600 hover:text-primary-600 mb-6">
                        ← 목록으로 돌아가기
                    </Link>

                    {/* Rating Form (if shown) */}
                    {showRatingForm && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-primary-200">
                            <h3 className="text-xl font-bold mb-4">평점 남기기</h3>
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
                                                className={`text-3xl ${value <= priceRating ? 'text-primary-600' : 'text-neutral-300'}`}
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
                                                className={`text-3xl ${value <= qualityRating ? 'text-primary-600' : 'text-neutral-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                        <span className="ml-2 text-lg font-bold">{qualityRating}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmitRating}
                                        disabled={submitting}
                                        className="btn btn-primary disabled:opacity-50"
                                    >
                                        {submitting ? '저장 중...' : '평점 저장'}
                                    </button>
                                    <button
                                        onClick={() => setShowRatingForm(false)}
                                        className="btn btn-secondary"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic Info Card */}
                    <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-4">기본 정보</h2>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-neutral-600 mb-1">가격</dt>
                                <dd className="text-xl font-bold text-primary-600">
                                    {product.price.toLocaleString()}원
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-neutral-600 mb-1">내용량</dt>
                                <dd className="text-lg font-medium">{product.contentVolume}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-neutral-600 mb-1">제조사</dt>
                                <dd className="text-lg font-medium">{product.manufacturer}</dd>
                            </div>
                            {product.maker && (
                                <div>
                                    <dt className="text-sm text-neutral-600 mb-1">제조원</dt>
                                    <dd className="text-lg font-medium">{product.maker}</dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    {/* User Ratings Card */}
                    <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-4">사용자 평가</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm text-neutral-600 mb-1">가격 대비 만족도</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-primary-600">
                                        {product.avgPriceRating?.toFixed(1) || '0.0'}
                                    </span>
                                    <span className="text-primary-600 text-2xl">★</span>
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm text-neutral-600 mb-1">맛/품질 만족도</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-primary-600">
                                        {product.avgQualityRating?.toFixed(1) || '0.0'}
                                    </span>
                                    <span className="text-primary-600 text-2xl">★</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-600 mt-4">
                            총 {product.totalRatings || 0}명이 평가했습니다
                        </p>
                    </section>

                    {/* Nutrition Info Card */}
                    <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-4">영양 정보</h2>
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
                    </section>

                    {/* Comments Section */}
                    <section id="comment-section" className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-6">댓글 ({comments.length})</h2>

                        {/* Comment Form */}
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
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                    >
                                        {commentSubmitting ? '작성 중...' : '댓글 작성'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-neutral-50 rounded-lg p-6 text-center mb-6">
                                <p className="text-neutral-600 mb-2">로그인하고 댓글을 작성해보세요</p>
                                <Link href="/login" className="text-primary-600 hover:underline font-medium">
                                    로그인하기
                                </Link>
                            </div>
                        )}

                        {/* Comment List */}
                        {comments.length === 0 ? (
                            <p className="text-center text-neutral-500 py-8">
                                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.comment_id}
                                        className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* User Avatar Placeholder */}
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-primary-600 font-medium">👤</span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-neutral-900">사용자</span>
                                                    <span className="text-xs text-neutral-500">
                                                        {new Date(comment.created_at).toLocaleString('ko-KR')}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-700 leading-relaxed">{comment.comment}</p>
                                                {user?.id === comment.user_id && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.comment_id)}
                                                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
