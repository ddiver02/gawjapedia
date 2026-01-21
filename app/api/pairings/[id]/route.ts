import { NextRequest, NextResponse } from 'next/server';
import {
    getPairingById,
    updatePairing,
    deletePairing,
} from '@/lib/supabase/pairings';
import {
    validatePairingProducts,
    validatePairingTitle,
    PAIRING_CONSTRAINTS,
} from '@/types/pairing';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pairings/[id]
 * 
 * Get pairing detail with full product information
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const pairing = await getPairingById(params.id, user?.id);

        if (!pairing) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Pairing not found',
                        code: 'NOT_FOUND',
                    },
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: pairing,
        });
    } catch (error) {
        console.error('Get pairing error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Failed to fetch pairing',
                    code: 'FETCH_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/pairings/[id]
 * 
 * Update pairing (owner only)
 * 
 * Body:
 * {
 *   title?: string,
 *   description?: string,
 *   productIds?: string[]
 * }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Verify ownership
        const existing = await getPairingById(params.id, user.id);
        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Pairing not found',
                        code: 'NOT_FOUND',
                    },
                },
                { status: 404 }
            );
        }

        if (existing.userId !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '권한이 없습니다',
                        code: 'FORBIDDEN',
                    },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, description, productIds } = body;

        // Validate title if provided
        if (title) {
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
        }

        // Validate product IDs if provided
        if (productIds) {
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
        }

        // Validate description length
        if (description !== undefined && description && description.length > PAIRING_CONSTRAINTS.MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: `Description must be at most ${PAIRING_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} characters`,
                        code: 'VALIDATION_ERROR',
                    },
                },
                { status: 400 }
            );
        }

        const updated = await updatePairing(
            params.id,
            {
                title,
                description,
                productIds,
            },
            user.id
        );

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error('Update pairing error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Failed to update pairing',
                    code: 'UPDATE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/pairings/[id]
 * 
 * Delete pairing (owner only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Verify ownership
        const existing = await getPairingById(params.id, user.id);
        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Pairing not found',
                        code: 'NOT_FOUND',
                    },
                },
                { status: 404 }
            );
        }

        if (existing.userId !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '권한이 없습니다',
                        code: 'FORBIDDEN',
                    },
                },
                { status: 403 }
            );
        }

        const deleted = await deletePairing(params.id, user.id);

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Failed to delete pairing',
                        code: 'DELETE_ERROR',
                    },
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { deleted: true },
        });
    } catch (error) {
        console.error('Delete pairing error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Failed to delete pairing',
                    code: 'DELETE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
