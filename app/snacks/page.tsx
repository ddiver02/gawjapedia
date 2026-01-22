'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import { Product, ProductCategory } from '@/types/product';

export default function SnacksPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories: (ProductCategory | '')[] = ['', '과자', '초콜릿', '캔디', '젤리', '건과류', '아이스크림', '음료', '기타'];

    useEffect(() => {
        fetchProducts();
    }, [page, selectedCategory, searchQuery]);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(selectedCategory && { category: selectedCategory }),
                ...(searchQuery && { search: searchQuery }),
            });

            const response = await fetch(`/api/products?${params}`);
            const data = await response.json();

            if (data.success) {
                setProducts(data.data.products);
                setTotalPages(data.data.pagination.totalPages);
            } else {
                setError('제품 목록을 불러오는 데 실패했습니다.');
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
        fetchProducts();
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
                                    setSelectedCategory(e.target.value as ProductCategory | '');
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
                        <div className="text-center py-20">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => fetchProducts()}
                                className="btn btn-primary"
                            >
                                다시 시도
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-neutral-600 mb-4">검색 결과가 없습니다.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('');
                                    setPage(1);
                                }}
                                className="btn btn-outline"
                            >
                                필터 초기화
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        showCategory={!selectedCategory}
                                    />
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
