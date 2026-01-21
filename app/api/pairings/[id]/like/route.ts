import { NextRequest, NextResponse } from 'next/server';
import { togglePairingLike } from '@/lib/supabase/pairings';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/pairings/[id]/like
 * 
 * Toggle like on a pairing
 * 
 * Returns:
 * {
 *   success: true,
 *   data: { liked: boolean }
 * }
 */
export async function POST(
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

        const result = await togglePairingLike(params.id, user.id);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Toggle like error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Failed to toggle like',
                    code: 'LIKE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
