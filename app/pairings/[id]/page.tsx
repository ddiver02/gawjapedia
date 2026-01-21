'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Pairing } from '@/types/pairing';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PairingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [pairing, setPairing] = useState<Pairing | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPairing();
    }, [params.id]);

    const fetchPairing = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/pairings/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setPairing(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch pairing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다');
            return;
        }

        try {
            const response = await fetch(`/api/pairings/${params.id}/like`, {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                setPairing((prev) =>
                    prev
                        ? {
                            ...prev,
                            isLikedByUser: data.data.liked,
                            likesCount: data.data.liked ? prev.likesCount + 1 : prev.likesCount - 1,
                        }
                        : null
                );
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const response = await fetch(`/api/pairings/${params.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                alert('삭제되었습니다');
                router.push('/pairings');
            } else {
                alert('삭제 실패: ' + data.error.message);
            }
        } catch (error) {
            console.error('Failed to delete pairing:', error);
            alert('삭제 중 오류가 발생했습니다');
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

    if (!pairing) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">페어링을 찾을 수 없습니다</h2>
                        <Link href="/pairings" className="btn btn-primary">
                            목록으로 돌아가기
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const isOwner = user?.id === pairing.userId;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-neutral-50">
                <div className="container py-8">
                    {/* Back Button */}
                    <Link
                        href="/pairings"
                        className="inline-flex items-center text-neutral-600 hover:text-primary-600 mb-6"
                    >
                        ← 목록으로
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{pairing.title}</h1>
                                {pairing.description && (
                                    <p className="text-neutral-700 text-lg">{pairing.description}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${pairing.isLikedByUser
                                            ? 'bg-red-50 text-red-600'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                        }`}
                                >
                                    <span className="text-xl">{pairing.isLikedByUser ? '❤️' : '🤍'}</span>
                                    <span className="font-medium">{pairing.likesCount}</span>
                                </button>

                                {isOwner && (
                                    <>
                                        <Link
                                            href={`/pairings/${params.id}/edit`}
                                            className="btn btn-secondary"
                                        >
                                            수정
                                        </Link>
                                        <button onClick={handleDelete} className="btn btn-danger">
                                            삭제
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Products */}
                        <div>
                            <h2 className="text-xl font-bold mb-4">
                                이 조합에 포함된 제품 ({pairing.products.length}개)
                            </h2>

                            <div className="space-y-4">
                                {pairing.products.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary-300 transition"
                                    >
                                        {/* Number */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                                            {index + 1}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <Link
                                                href={`/snacks/${product.id}`}
                                                className="font-bold text-lg hover:text-primary-600 transition"
                                            >
                                                {product.title}
                                            </Link>
                                            <p className="text-sm text-neutral-600">{product.manufacturer}</p>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <div className="badge badge-primary">{product.category}</div>
                                            <p className="text-sm text-neutral-600 mt-1">
                                                평점 {product.score}/10
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 p-6 bg-primary-50 rounded-lg text-center">
                            <p className="text-lg font-medium text-primary-900 mb-4">
                                이 조합을 직접 체험해보세요!
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                {pairing.products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/snacks/${product.id}`}
                                        className="btn btn-primary"
                                    >
                                        {product.title} 보기
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
