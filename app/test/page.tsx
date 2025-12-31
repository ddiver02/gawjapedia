'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { TastePreference } from '@/lib/recommendation/types';

const TASTE_OPTIONS: TastePreference[] = [
    '단맛', '짠맛', '신맛', '쓴맛', '매운맛',
    '고소한맛', '바삭한', '부드러운', '쫄깃한'
];

export default function PreferenceTestPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedTastes, setSelectedTastes] = useState<TastePreference[]>([]);
    const [time, setTime] = useState('');
    const [place, setPlace] = useState('');
    const [maxCalories, setMaxCalories] = useState('');

    const toggleTaste = (taste: TastePreference) => {
        setSelectedTastes(prev =>
            prev.includes(taste)
                ? prev.filter(t => t !== taste)
                : [...prev, taste]
        );
    };

    const handleComplete = () => {
        // 선호도를 localStorage에 저장
        const preferences = {
            tastes: selectedTastes,
            tpo: {
                time,
                place,
            },
            nutrition: {
                maxCalories: maxCalories ? parseInt(maxCalories) : undefined,
            },
        };

        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        router.push('/recommendations');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
                <div className="container max-w-3xl">
                    <div className="card">
                        <div className="card-body">
                            {/* 진행 상황 */}
                            <div className="mb-8">
                                <div className="flex justify-between text-sm text-neutral-600 mb-2">
                                    <span>단계 {step}/3</span>
                                    <span>{Math.round((step / 3) * 100)}% 완료</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(step / 3) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Step 1: 맛 선호도 */}
                            {step === 1 && (
                                <div className="animate-fade-in">
                                    <h2 className="text-2xl font-bold mb-2">어떤 맛을 좋아하시나요?</h2>
                                    <p className="text-neutral-600 mb-6">
                                        좋아하는 맛을 모두 선택해주세요 (복수 선택 가능)
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                        {TASTE_OPTIONS.map((taste) => (
                                            <button
                                                key={taste}
                                                onClick={() => toggleTaste(taste)}
                                                className={`p-4 rounded-lg border-2 transition-all ${selectedTastes.includes(taste)
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                                                        : 'border-neutral-200 hover:border-primary-300'
                                                    }`}
                                            >
                                                {taste}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={selectedTastes.length === 0}
                                        className="btn btn-primary w-full"
                                    >
                                        다음
                                    </button>
                                </div>
                            )}

                            {/* Step 2: TPO */}
                            {step === 2 && (
                                <div className="animate-fade-in">
                                    <h2 className="text-2xl font-bold mb-2">언제, 어디서 드시나요?</h2>
                                    <p className="text-neutral-600 mb-6">
                                        간식을 즐기는 상황을 선택해주세요
                                    </p>

                                    <div className="space-y-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">시간대</label>
                                            <select
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className="input"
                                            >
                                                <option value="">선택하세요</option>
                                                <option value="아침">아침</option>
                                                <option value="점심">점심</option>
                                                <option value="저녁">저녁</option>
                                                <option value="야식">야식</option>
                                                <option value="간식시간">간식시간</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">장소</label>
                                            <select
                                                value={place}
                                                onChange={(e) => setPlace(e.target.value)}
                                                className="input"
                                            >
                                                <option value="">선택하세요</option>
                                                <option value="집">집</option>
                                                <option value="사무실">사무실</option>
                                                <option value="학교">학교</option>
                                                <option value="야외">야외</option>
                                                <option value="운동">운동</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="btn btn-ghost flex-1">
                                            이전
                                        </button>
                                        <button onClick={() => setStep(3)} className="btn btn-primary flex-1">
                                            다음
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: 영양 선호도 */}
                            {step === 3 && (
                                <div className="animate-fade-in">
                                    <h2 className="text-2xl font-bold mb-2">건강한 선택을 하세요</h2>
                                    <p className="text-neutral-600 mb-6">
                                        영양 기준을 설정해주세요 (선택사항)
                                    </p>

                                    <div className="space-y-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                최대 칼로리 (kcal)
                                            </label>
                                            <input
                                                type="number"
                                                value={maxCalories}
                                                onChange={(e) => setMaxCalories(e.target.value)}
                                                className="input"
                                                placeholder="예: 300"
                                                min="0"
                                            />
                                            <p className="text-xs text-neutral-500 mt-1">
                                                입력하지 않으면 제한 없음
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                                        <h3 className="font-semibold text-primary-900 mb-2">선택 요약</h3>
                                        <ul className="text-sm text-primary-800 space-y-1">
                                            <li>• 선호 맛: {selectedTastes.join(', ')}</li>
                                            {time && <li>• 시간: {time}</li>}
                                            {place && <li>• 장소: {place}</li>}
                                            {maxCalories && <li>• 최대 칼로리: {maxCalories}kcal</li>}
                                        </ul>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(2)} className="btn btn-ghost flex-1">
                                            이전
                                        </button>
                                        <button onClick={handleComplete} className="btn btn-primary flex-1">
                                            추천 받기
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
