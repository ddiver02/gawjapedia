'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Header() {
    const pathname = usePathname();
    const { user, loading, signOut } = useAuth();

    const isActive = (path: string) => pathname === path;

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/';
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* 로고 */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-2xl">🥨</span>
                        <span className="text-xl font-display font-bold text-gradient">
                            GawjaPedia
                        </span>
                    </Link>

                    {/* 네비게이션 링크 */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/snacks"
                            className={`hover:text-primary-600 transition-colors ${isActive('/snacks') ? 'text-primary-600 font-semibold' : 'text-neutral-700'
                                }`}
                        >
                            간식 목록
                        </Link>

                        <Link
                            href="/pairings"
                            className={`hover:text-primary-600 transition-colors ${isActive('/pairings') ? 'text-primary-600 font-semibold' : 'text-neutral-700'
                                }`}
                        >
                            페어링
                        </Link>

                        <Link
                            href="/test"
                            className={`hover:text-primary-600 transition-colors ${isActive('/test') ? 'text-primary-600 font-semibold' : 'text-neutral-700'
                                }`}
                        >
                            취향 테스트
                        </Link>

                        <Link
                            href="/recommendations"
                            className={`hover:text-primary-600 transition-colors ${isActive('/recommendations') ? 'text-primary-600 font-semibold' : 'text-neutral-700'
                                }`}
                        >
                            추천 받기
                        </Link>
                    </div>

                    {/* 사용자 메뉴 */}
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 spinner" />
                        ) : user ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="hidden md:block text-neutral-700 hover:text-primary-600 transition-colors"
                                >
                                    마이페이지
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="btn btn-ghost text-sm"
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn btn-ghost text-sm">
                                    로그인
                                </Link>
                                <Link href="/signup" className="btn btn-primary text-sm">
                                    회원가입
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
