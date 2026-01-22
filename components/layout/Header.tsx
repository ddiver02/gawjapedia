'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, signOut } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const isActive = (path: string) => pathname === path;

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/';
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/snacks?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
            <nav className="container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-2xl">🥨</span>
                        <span className="text-xl font-bold text-neutral-900">
                            GawjaPedia
                        </span>
                    </Link>

                    {/* Center Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/snacks"
                            className={`text-sm font-medium transition-colors ${isActive('/snacks')
                                    ? 'text-primary-600'
                                    : 'text-neutral-700 hover:text-neutral-900'
                                }`}
                        >
                            간식
                        </Link>
                        <Link
                            href="/pairings"
                            className={`text-sm font-medium transition-colors ${isActive('/pairings')
                                    ? 'text-primary-600'
                                    : 'text-neutral-700 hover:text-neutral-900'
                                }`}
                        >
                            페어링
                        </Link>
                        <Link
                            href="/recommendations"
                            className={`text-sm font-medium transition-colors ${isActive('/recommendations')
                                    ? 'text-primary-600'
                                    : 'text-neutral-700 hover:text-neutral-900'
                                }`}
                        >
                            추천
                        </Link>
                    </div>

                    {/* Right: Search + Auth */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="hidden sm:block">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="검색"
                                className="w-48 lg:w-64 px-4 py-2 text-sm bg-neutral-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                        </form>

                        {/* Auth Buttons */}
                        {loading ? (
                            <div className="w-8 h-8 spinner" />
                        ) : user ? (
                            <button
                                onClick={handleSignOut}
                                className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
                            >
                                로그아웃
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-sm bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition-colors"
                                >
                                    회원가입
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
