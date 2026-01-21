/**
 * Product Pairing Type Definitions
 */

import type { Product } from './product';

// ============================================
// Database Types
// ============================================

export interface PairingDB {
    pairing_id: string;
    user_id: string;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    likes_count: number;
}

export interface PairingProductDB {
    pairing_id: string;
    product_id: string;
    position: number;
    created_at: string;
}

export interface PairingLikeDB {
    pairing_id: string;
    user_id: string;
    created_at: string;
}

// ============================================
// Application Types
// ============================================

export interface Pairing {
    pairingId: string;
    userId: string;
    title: string;
    description?: string;
    products: Product[];
    likesCount: number;
    isLikedByUser?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PairingSummary {
    pairingId: string;
    userId: string;
    userName?: string;
    title: string;
    description?: string;
    productIds: string[];
    productThumbnails: string[]; // First 3 product images
    likesCount: number;
    isLikedByUser?: boolean;
    createdAt: string;
}

// ============================================
// Request/Response Types
// ============================================

export interface CreatePairingRequest {
    title: string;
    description?: string;
    productIds: string[]; // 2-5 products
}

export interface UpdatePairingRequest {
    title?: string;
    description?: string;
    productIds?: string[]; // 2-5 products
}

export interface GetPairingsOptions {
    sort?: 'latest' | 'popular';
    userId?: string; // Filter by creator
    productId?: string; // Filter by product
    limit?: number;
    offset?: number;
}

// ============================================
// Validation
// ============================================

export const PAIRING_CONSTRAINTS = {
    MIN_PRODUCTS: 2,
    MAX_PRODUCTS: 5,
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
} as const;

export function validatePairingProducts(productIds: string[]): {
    valid: boolean;
    error?: string;
} {
    if (!Array.isArray(productIds)) {
        return { valid: false, error: 'Product IDs must be an array' };
    }

    if (productIds.length < PAIRING_CONSTRAINTS.MIN_PRODUCTS) {
        return {
            valid: false,
            error: `Minimum ${PAIRING_CONSTRAINTS.MIN_PRODUCTS} products required`,
        };
    }

    if (productIds.length > PAIRING_CONSTRAINTS.MAX_PRODUCTS) {
        return {
            valid: false,
            error: `Maximum ${PAIRING_CONSTRAINTS.MAX_PRODUCTS} products allowed`,
        };
    }

    // Check for duplicates
    const uniqueIds = new Set(productIds);
    if (uniqueIds.size !== productIds.length) {
        return { valid: false, error: 'Duplicate products are not allowed' };
    }

    return { valid: true };
}

export function validatePairingTitle(title: string): {
    valid: boolean;
    error?: string;
} {
    if (!title || typeof title !== 'string') {
        return { valid: false, error: 'Title is required' };
    }

    const trimmed = title.trim();

    if (trimmed.length < PAIRING_CONSTRAINTS.MIN_TITLE_LENGTH) {
        return {
            valid: false,
            error: `Title must be at least ${PAIRING_CONSTRAINTS.MIN_TITLE_LENGTH} characters`,
        };
    }

    if (trimmed.length > PAIRING_CONSTRAINTS.MAX_TITLE_LENGTH) {
        return {
            valid: false,
            error: `Title must be at most ${PAIRING_CONSTRAINTS.MAX_TITLE_LENGTH} characters`,
        };
    }

    return { valid: true };
}
