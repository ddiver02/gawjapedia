import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-neutral-900 text-neutral-300 py-12 mt-auto">
            <div className="container">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    {/* 브랜드 */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">GawjaPedia</h3>
                        <p className="text-sm">
                            스마트 간식 추천 서비스<br />
                            건강하고 맛있는 간식 선택의 시작
                        </p>
                    </div>

                    {/* 바로가기 */}
                    <div>
                        <h4 className="font-bold text-white mb-4">바로가기</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/snacks" className="hover:text-primary-400 transition-colors">
                                    간식 목록
                                </Link>
                            </li>
                            <li>
                                <Link href="/test" className="hover:text-primary-400 transition-colors">
                                    취향 테스트
                                </Link>
                            </li>
                            <li>
                                <Link href="/recommendations" className="hover:text-primary-400 transition-colors">
                                    추천 받기
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 계정 */}
                    <div>
                        <h4 className="font-bold text-white mb-4">계정</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/login" className="hover:text-primary-400 transition-colors">
                                    로그인
                                </Link>
                            </li>
                            <li>
                                <Link href="/signup" className="hover:text-primary-400 transition-colors">
                                    회원가입
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile" className="hover:text-primary-400 transition-colors">
                                    마이페이지
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-6 text-center text-sm">
                    <p>&copy; 2024 GawjaPedia. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
