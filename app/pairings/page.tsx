'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PairingSummary } from '@/types/pairing';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PairingsPage() {
    const { user } = useAuth();
    const [pairings, setPairings] = useState<PairingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

    useEffect(() => {
        fetchPairings();
    }, [sortBy]);

    const fetchPairings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/pairings?sort=${sortBy}`);
            const data = await response.json();

            if (data.success) {
                setPairings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch pairings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (pairingId: string) => {
        if (!user) {
            alert('로그인이 필요합니다');
            return;
        }

        try {
            const response = await fetch(`/api/pairings/${pairingId}/like`, {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                // Update local state
                setPairings((prev) =>
                    prev.map((p) =>
                        p.pairingId === pairingId
                            ? {
                                ...p,
                                isLikedByUser: data.data.liked,
                                likesCount: data.data.liked ? p.likesCount + 1 : p.likesCount - 1,
                            }
                            : p
                    )
                );
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-neutral-50">
                <div className="container py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">제품 페어링</h1>
                            <p className="text-neutral-600">사용자들이 추천하는 맛있는 조합</p>
                        </div>

                        {user && (
                            <Link href="/pairings/create" className="btn btn-primary">
                                + 페어링 만들기
                            </Link>
                        )}
                    </div>

                    {/* Sort Tabs */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setSortBy('latest')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${sortBy === 'latest'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                                }`}
                        >
                            최신순
                        </button>
                        <button
                            onClick={() => setSortBy('popular')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${sortBy === 'popular'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                                }`}
                        >
                            인기순
                        </button>
                    </div>

                    {/* Pairings Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : pairings.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-600 mb-4">아직 페어링이 없습니다</p>
                            {user && (
                                <Link href="/pairings/create" className="btn btn-primary">
                                    첫 페어링 만들기
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pairings.map((pairing) => (
                                <div
                                    key={pairing.pairingId}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                                >
                                    <Link href={`/pairings/${pairing.pairingId}`}>
                                        {/* Product Count Banner */}
                                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 text-sm font-medium">
                                            {pairing.productIds.length}개 제품 조합
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2">
                                                {pairing.title}
                                            </h3>

                                            {pairing.description && (
                                                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                                                    {pairing.description}
                                                </p>
                                            )}

                                            {/* Product IDs preview */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {pairing.productIds.slice(0, 3).map((id) => (
                                                    <span
                                                        key={id}
                                                        className="badge badge-secondary text-xs"
                                                    >
                                                        제품 {id}
                                                    </span>
                                                ))}
                                                {pairing.productIds.length > 3 && (
                                                    <span className="badge badge-neutral text-xs">
                                                        +{pairing.productIds.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Footer */}
                                    <div className="px-6 pb-4 flex items-center justify-between border-t pt-4">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLike(pairing.pairingId);
                                            }}
                                            className={`flex items-center gap-2 transition ${pairing.isLikedByUser
                                                    ? 'text-red-500'
                                                    : 'text-neutral-500 hover:text-red-500'
                                                }`}
                                        >
                                            <span className="text-xl">
                                                {pairing.isLikedByUser ? '❤️' : '🤍'}
                                            </span>
                                            <span className="text-sm font-medium">{pairing.likesCount}</span>
                                        </button>

                                        <Link
                                            href={`/pairings/${pairing.pairingId}`}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            자세히 보기 →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
