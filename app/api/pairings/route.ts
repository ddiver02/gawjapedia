import { NextRequest, NextResponse } from 'next/server';
import {
    getAllPairings,
    createPairing,
} from '@/lib/supabase/pairings';
import {
    validatePairingProducts,
    validatePairingTitle,
    PAIRING_CONSTRAINTS,
} from '@/types/pairing';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pairings
 * 
 * Get all pairings with optional filtering and sorting
 * 
 * Query params:
 * - sort: 'latest' | 'popular' (default: 'latest')
 * - userId: filter by creator
 * - productId: filter by product
 * - limit: number (default: 20)
 * - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sort = searchParams.get('sort') as 'latest' | 'popular' | null;
        const userId = searchParams.get('userId');
        const productId = searchParams.get('productId');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Get current user for like status
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const pairings = await getAllPairings(
            {
                sort: sort || 'latest',
                userId: userId || undefined,
                productId: productId || undefined,
                limit,
                offset,
            },
            user?.id
        );

        return NextResponse.json({
            success: true,
            data: pairings,
            pagination: {
                limit,
                offset,
                hasMore: pairings.length === limit,
            },
        });
    } catch (error) {
        console.error('Pairings API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Failed to fetch pairings',
                    code: 'FETCH_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/pairings
 * 
 * Create a new pairing
 * 
 * Body:
 * {
 *   title: string,
 *   description?: string,
 *   productIds: string[]
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '로그인이 필요합니다',
                        code: 'UNAUTHORIZED',
                    },
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, productIds } = body;

        // Validate title
        const titleValidation = validatePairingTitle(title);
        if (!titleValidation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: titleValidation.error,
                        code: 'VALIDATION_ERROR',
                    },
                },
                { status: 400 }
            );
        }

        // Validate product IDs
        const productValidation = validatePairingProducts(productIds);
        if (!productValidation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: productValidation.error,
                        code: 'VALIDATION_ERROR',
                    },
                },
                { status: 400 }
            );
        }

        // Validate description length
        if (description && description.length > PAIRING_CONSTRAINTS.MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: `Description must be at must ${PAIRING_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} characters`,
                        code: 'VALIDATION_ERROR',
                    },
                },
                { status: 400 }
            );
        }

        // Verify all products exist
        const { data: products, error: productsError } = await supabase
            .from('product_infos')
            .select('id')
            .in('id', productIds);

        if (productsError || !products || products.length !== productIds.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'One or more products not found',
                        code: 'INVALID_PRODUCTS',
                    },
                },
                { status: 400 }
            );
        }

        const pairing = await createPairing(
            {
                title,
                description,
                productIds,
            },
            user.id
        );

        return NextResponse.json({
            success: true,
            data: pairing,
        });
    } catch (error) {
        console.error('Create pairing error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Failed to create pairing',
                    code: 'CREATE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
