import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'GawjaPedia - 스마트 간식 추천 서비스',
    description: '당신의 취향과 상황에 딱 맞는 간식을 추천해드립니다. 영양 정보 기반의 건강한 간식 선택을 도와줍니다.',
    keywords: ['간식', '추천', '영양정보', 'TPO', '건강간식'],
    authors: [{ name: 'GawjaPedia Team' }],
    openGraph: {
        title: 'GawjaPedia - 스마트 간식 추천 서비스',
        description: '당신의 취향과 상황에 딱 맞는 간식을 추천해드립니다',
        type: 'website',
        locale: 'ko_KR',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-sans bg-neutral-50 text-neutral-900 antialiased">
                {children}
            </body>
        </html>
    );
}
