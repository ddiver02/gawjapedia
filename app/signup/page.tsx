'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SignUpPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 비밀번호 확인
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password, username);
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            router.push('/login');
        } catch (err: any) {
            console.error('Signup error:', err);

            // 이메일 확인 관련 에러 처리
            if (err.message?.includes('confirmation email') ||
                err.message?.includes('sending email') ||
                err.message?.includes('Error sending')) {
                setError(
                    '✉️ 이메일 확인 설정 문제\n\n' +
                    'Supabase에서 이메일 자동 확인을 활성화해주세요:\n' +
                    '1. Supabase Dashboard 접속\n' +
                    '2. Authentication > Configuration > Auth Providers\n' +
                    '3. Email 섹션에서 "Enable Email Autoconfirm" 체크\n' +
                    '4. Save 클릭'
                );
            } else if (err.message?.includes('already registered') ||
                err.message?.includes('User already registered')) {
                setError('이미 등록된 이메일입니다.');
            } else {
                setError(err.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
                <div className="card w-full max-w-md">
                    <div className="card-body">
                        <h1 className="text-3xl font-display font-bold text-center mb-6">
                            회원가입
                        </h1>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                                    사용자명 (선택)
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input"
                                    placeholder="닉네임"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                                    이메일 *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input"
                                    placeholder="example@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                                    비밀번호 *
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <p className="text-xs text-neutral-500 mt-1">최소 6자 이상</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                                    비밀번호 확인 *
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                {loading ? '가입 중...' : '회원가입'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-neutral-600">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                로그인
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
