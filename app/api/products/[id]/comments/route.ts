import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/products/[id]/comments
 * 
 * 제품에 댓글 작성
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        // 인증 확인
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
        const { comment } = body;

        if (!comment || comment.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '댓글 내용을 입력해주세요',
                        code: 'VALIDATION_ERROR',
                    },
                },
                { status: 400 }
            );
        }

        if (comment.length > 500) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '댓글은 500자를 초과할 수 없습니다',
                        code: 'VALIDATION_ERROR',
                    },
                },
                { status: 400 }
            );
        }

        // 댓글 생성
        const { data, error } = await supabase
            .from('product_comments')
            .insert({
                product_id: params.id,
                user_id: user.id,
                comment: comment.trim(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    comment: data,
                },
                message: '댓글이 작성되었습니다',
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Comment POST API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '댓글 작성에 실패했습니다',
                    code: 'COMMENT_CREATE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/products/[id]/comments?comment_id=xxx
 * 
 * 댓글 삭제 (본인만 가능)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        // 인증 확인
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

        const searchParams = request.nextUrl.searchParams;
        const commentId = searchParams.get('comment_id');

        if (!commentId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: '댓글 ID가 필요합니다',
                        code: 'VALIDATION_ERROR',
                    },
                },
                { status: 400 }
            );
        }

        // 댓글 삭제 (RLS로 본인 확인)
        const { error } = await supabase
            .from('product_comments')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);

        if (error) {
            throw error;
        }

        return NextResponse.json(
            {
                success: true,
                message: '댓글이 삭제되었습니다',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Comment DELETE API 에러:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : '댓글 삭제에 실패했습니다',
                    code: 'COMMENT_DELETE_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
