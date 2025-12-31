'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Snack, SnackCategory } from '@/types/snack';

export default function SnacksPage() {
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<SnackCategory | ''>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories: (SnackCategory | '')[] = ['', '과자', '초콜릿', '캔디', '젤리', '건과류', '아이스크림', '음료', '기타'];

    useEffect(() => {
        fetchSnacks();
    }, [page, selectedCategory, searchQuery]);

    const fetchSnacks = async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(selectedCategory && { category: selectedCategory }),
                ...(searchQuery && { search: searchQuery }),
            });

            const response = await fetch(`/api/snacks?${params}`);
            const data = await response.json();

            if (data.success) {
                setSnacks(data.data.snacks);
                setTotalPages(data.data.pagination.totalPages);
            } else {
                setError('간식 목록을 불러오는 데 실패했습니다.');
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchSnacks();
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-neutral-50">
                <div className="container py-8">
                    {/* 헤더 */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-display font-bold mb-4">간식 목록</h1>
                        <p className="text-neutral-600">
                            다양한 간식을 둘러보고 영양 정보를 확인하세요
                        </p>
                    </div>

                    {/* 검색 및 필터 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="간식 이름 또는 제조사 검색..."
                                className="input flex-1"
                            />

                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value as SnackCategory | '');
                                    setPage(1);
                                }}
                                className="input md:w-48"
                            >
                                <option value="">모든 카테고리</option>
                                {categories.filter(c => c !== '').map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <button type="submit" className="btn btn-primary md:w-32">
                                검색
                            </button>
                        </form>
                    </div>

                    {/* 간식 그리드 */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="spinner"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                            {error}
                        </div>
                    ) : snacks.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-neutral-600 text-lg">검색 결과가 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {snacks.map((snack) => (
                                    <Link
                                        key={snack.id}
                                        href={`/snacks/${snack.id}`}
                                        className="card hover:scale-105 transition-transform"
                                    >
                                        <div className="card-body">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="badge badge-primary">{snack.category}</span>
                                            </div>

                                            <h3 className="font-bold text-lg mb-2 line-clamp-2">{snack.name}</h3>
                                            <p className="text-sm text-neutral-600 mb-3">{snack.manufacturer}</p>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-500">{snack.contentVolume}</span>
                                                <span className="font-bold text-primary-600">
                                                    {snack.price.toLocaleString()}원
                                                </span>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                                                {snack.nutrition.calories}kcal • 단백질 {snack.nutrition.protein}g
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* 페이지네이션 */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn btn-ghost"
                                    >
                                        이전
                                    </button>

                                    <span className="flex items-center px-4 text-neutral-600">
                                        {page} / {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="btn btn-ghost"
                                    >
                                        다음
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
