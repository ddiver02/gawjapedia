'use client';

import { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Product } from '@/types/product';
import { PAIRING_CONSTRAINTS } from '@/types/pairing';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CreatePairingPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            alert('로그인이 필요합니다');
            router.push('/login');
        }
    }, [user]);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timer = setTimeout(() => {
                searchProducts();
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const searchProducts = async () => {
        try {
            const response = await fetch(`/api/products?search=${searchQuery}&limit=10`);
            const data = await response.json();

            if (data.success) {
                // Filter out already selected products
                const selectedIds = selectedProducts.map((p) => p.id);
                const filtered = data.data.products.filter(
                    (p: Product) => !selectedIds.includes(p.id)
                );
                setSearchResults(filtered);
            }
        } catch (error) {
            console.error('Failed to search products:', error);
        }
    };

    const addProduct = (product: Product) => {
        if (selectedProducts.length >= PAIRING_CONSTRAINTS.MAX_PRODUCTS) {
            alert(`최대 ${PAIRING_CONSTRAINTS.MAX_PRODUCTS}개까지 선택할 수 있습니다`);
            return;
        }

        setSelectedProducts([...selectedProducts, product]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
    };

    const moveProduct = (index: number, direction: 'up' | 'down') => {
        const newProducts = [...selectedProducts];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newProducts.length) return;

        [newProducts[index], newProducts[targetIndex]] = [
            newProducts[targetIndex],
            newProducts[index],
        ];

        setSelectedProducts(newProducts);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('제목을 입력해주세요');
            return;
        }

        if (selectedProducts.length < PAIRING_CONSTRAINTS.MIN_PRODUCTS) {
            alert(`최소 ${PAIRING_CONSTRAINTS.MIN_PRODUCTS}개 이상의 제품을 선택해주세요`);
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/pairings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    productIds: selectedProducts.map((p) => p.id),
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('페어링이 생성되었습니다!');
                router.push(`/pairings/${data.data.pairingId}`);
            } else {
                alert('생성 실패: ' + data.error.message);
            }
        } catch (error) {
            console.error('Failed to create pairing:', error);
            alert('생성 중 오류가 발생했습니다');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-neutral-50">
                <div className="container py-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <Link
                                href="/pairings"
                                className="inline-flex items-center text-neutral-600 hover:text-primary-600 mb-4"
                            >
                                ← 뒤로
                            </Link>
                            <h1 className="text-3xl font-bold mb-2">새 페어링 만들기</h1>
                            <p className="text-neutral-600">
                                2-5개의 제품을 선택하여 나만의 조합을 만들어보세요
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <label htmlFor="title" className="block font-medium mb-2">
                                    제목 *
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="예: 야식 최강 조합"
                                    className="input w-full"
                                    maxLength={PAIRING_CONSTRAINTS.MAX_TITLE_LENGTH}
                                    required
                                />
                                <p className="text-sm text-neutral-500 mt-1">
                                    {title.length}/{PAIRING_CONSTRAINTS.MAX_TITLE_LENGTH}
                                </p>
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <label htmlFor="description" className="block font-medium mb-2">
                                    설명 (선택)
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="이 조합을 추천하는 이유를 알려주세요"
                                    className="input w-full"
                                    rows={3}
                                    maxLength={PAIRING_CONSTRAINTS.MAX_DESCRIPTION_LENGTH}
                                />
                                <p className="text-sm text-neutral-500 mt-1">
                                    {description.length}/{PAIRING_CONSTRAINTS.MAX_DESCRIPTION_LENGTH}
                                </p>
                            </div>

                            {/* Selected Products */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium">
                                        선택한 제품 ({selectedProducts.length}/{PAIRING_CONSTRAINTS.MAX_PRODUCTS})
                                    </h3>
                                    {selectedProducts.length < PAIRING_CONSTRAINTS.MIN_PRODUCTS && (
                                        <span className="text-sm text-red-600">
                                            최소 {PAIRING_CONSTRAINTS.MIN_PRODUCTS}개 필요
                                        </span>
                                    )}
                                </div>

                                {selectedProducts.length === 0 ? (
                                    <p className="text-neutral-500 text-center py-8">
                                        아래에서 제품을 검색하여 추가하세요
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedProducts.map((product, index) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center gap-3 p-3 border rounded-lg"
                                            >
                                                {/* Number */}
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                                                    {index + 1}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{product.title}</p>
                                                    <p className="text-sm text-neutral-600">{product.manufacturer}</p>
                                                </div>

                                                {/* Move Buttons */}
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveProduct(index, 'up')}
                                                        disabled={index === 0}
                                                        className="btn btn-sm btn-secondary disabled:opacity-30"
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveProduct(index, 'down')}
                                                        disabled={index === selectedProducts.length - 1}
                                                        className="btn btn-sm btn-secondary disabled:opacity-30"
                                                    >
                                                        ↓
                                                    </button>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(product.id)}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Search */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <label htmlFor="search" className="block font-medium mb-2">
                                    제품 검색
                                </label>
                                <input
                                    id="search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="제품명 입력..."
                                    className="input w-full"
                                    disabled={selectedProducts.length >= PAIRING_CONSTRAINTS.MAX_PRODUCTS}
                                />

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-3 border rounded-lg divide-y max-h-96 overflow-y-auto">
                                        {searchResults.map((product) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => addProduct(product)}
                                                className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="font-medium">{product.title}</p>
                                                    <p className="text-sm text-neutral-600">{product.manufacturer}</p>
                                                </div>
                                                <span className="text-primary-600">+ 추가</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4">
                                <Link href="/pairings" className="btn btn-secondary flex-1">
                                    취소
                                </Link>
                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        selectedProducts.length < PAIRING_CONSTRAINTS.MIN_PRODUCTS
                                    }
                                    className="btn btn-primary flex-1 disabled:opacity-50"
                                >
                                    {submitting ? '생성 중...' : '페어링 만들기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
