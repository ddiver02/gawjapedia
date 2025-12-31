import Link from 'next/link';

/**
 * 랜딩 페이지 (/)
 * 
 * GawjaPedia 서비스 소개 및 주요 기능 안내
 */
export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* 히어로 섹션 */}
            <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
                <div className="container py-20 md:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in">
                            당신에게 딱 맞는 간식,{' '}
                            <span className="text-gradient">GawjaPedia</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-neutral-600 mb-10 animate-slide-up">
                            취향, 상황, 영양까지 고려한 스마트 간식 추천 서비스
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                            <Link href="/test" className="btn btn-primary text-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                취향 테스트 시작하기
                            </Link>

                            <Link href="/snacks" className="btn btn-outline text-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                간식 둘러보기
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 장식 요소 */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            </section>

            {/* 주요 기능 섹션 */}
            <section className="section bg-white">
                <div className="container">
                    <h2 className="text-4xl font-display font-bold text-center mb-12">
                        왜 GawjaPedia일까요?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* 기능 1: 맞춤 추천 */}
                        <div className="card hover:scale-105 transition-transform">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">맞춤 추천</h3>
                                <p className="text-neutral-600">
                                    당신의 맛 선호도와 현재 상황(TPO)을 고려한
                                    AI 기반 간식 추천
                                </p>
                            </div>
                        </div>

                        {/* 기능 2: 영양 정보 */}
                        <div className="card hover:scale-105 transition-transform">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">상세한 영양 정보</h3>
                                <p className="text-neutral-600">
                                    칼로리, 단백질, 당류 등 29가지 영양성분 정보로
                                    건강한 선택을 도와드립니다
                                </p>
                            </div>
                        </div>

                        {/* 기능 3: 커뮤니티 */}
                        <div className="card hover:scale-105 transition-transform">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">리뷰 & 평점</h3>
                                <p className="text-neutral-600">
                                    다른 사용자들의 생생한 리뷰를 확인하고
                                    나만의 평가를 공유하세요
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA 섹션 */}
            <section className="section bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                <div className="container text-center">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        지금 바로 시작하세요!
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        간단한 취향 테스트로 나만의 간식 추천을 받아보세요
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg hover:bg-neutral-100 transition-colors shadow-xl"
                    >
                        무료로 가입하기
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* 푸터 */}
            <footer className="bg-neutral-900 text-neutral-300 py-12">
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">GawjaPedia</h3>
                            <p className="text-sm">
                                스마트 간식 추천 서비스<br />
                                건강하고 맛있는 간식 선택의 시작
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">바로가기</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/snacks" className="hover:text-primary-400">간식 목록</Link></li>
                                <li><Link href="/test" className="hover:text-primary-400">취향 테스트</Link></li>
                                <li><Link href="/recommendations" className="hover:text-primary-400">추천 받기</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">계정</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/login" className="hover:text-primary-400">로그인</Link></li>
                                <li><Link href="/signup" className="hover:text-primary-400">회원가입</Link></li>
                                <li><Link href="/profile" className="hover:text-primary-400">마이페이지</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-6 text-center text-sm">
                        <p>&copy; 2024 GawjaPedia. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
