import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    ranking?: number;
    showCategory?: boolean;
}

export default function ProductCard({ product, ranking, showCategory = true }: ProductCardProps) {
    return (
        <Link
            href={`/snacks/${product.id}`}
            className="group block transition-transform hover:scale-105"
        >
            <div className="relative">
                {/* Product Image Container - 2:3 aspect ratio */}
                <div className="relative aspect-[2/3] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    {/* Ranking Badge */}
                    {ranking && (
                        <div className="absolute top-2 left-2 z-10 bg-primary-600 text-white font-bold text-lg px-3 py-1 rounded-md shadow-lg">
                            {ranking}
                        </div>
                    )}

                    {/* Placeholder - replace with actual image when available */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-30">🥨</span>
                    </div>

                    {/* Score overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-primary-400 font-bold text-lg">★</span>
                            <span className="text-white font-bold">{product.score.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="mt-3">
                    <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 leading-tight mb-1">
                        {product.title}
                    </h3>
                    <p className="text-xs text-neutral-600">{product.manufacturer}</p>

                    {/* Bottom row: Category + Price */}
                    <div className="flex items-center justify-between mt-2">
                        {showCategory && (
                            <span className="text-xs text-neutral-500">{product.category}</span>
                        )}
                        {product.price > 0 && (
                            <span className="text-xs font-medium text-neutral-700">
                                ₩{product.price.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
