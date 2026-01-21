/**
 * Supabase Pairing Data Layer
 * 
 * CRUD operations for product pairings
 */

import { createClient } from '@/lib/supabase/server';
import type {
    Pairing,
    PairingSummary,
    CreatePairingRequest,
    UpdatePairingRequest,
    GetPairingsOptions,
    PairingDB,
    PairingProductDB,
} from '@/types/pairing';
import type { Product } from '@/types/product';

/**
 * Get all pairings with optional filtering and sorting
 */
export async function getAllPairings(
    options: GetPairingsOptions = {},
    currentUserId?: string
): Promise<PairingSummary[]> {
    const supabase = createClient();
    const {
        sort = 'latest',
        userId,
        productId,
        limit = 20,
        offset = 0,
    } = options;

    let query = supabase
        .from('pairings')
        .select(`
      pairing_id,
      user_id,
      title,
      description,
      likes_count,
      created_at,
      pairing_products (
        product_id,
        position
      )
    `);

    // Filter by creator
    if (userId) {
        query = query.eq('user_id', userId);
    }

    // Filter by product (pairings containing this product)
    if (productId) {
        query = query.contains('pairing_products.product_id', [productId]);
    }

    // Sorting
    if (sort === 'popular') {
        query = query.order('likes_count', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
        console.error('Failed to fetch pairings:', error);
        throw new Error('Failed to fetch pairings');
    }

    if (!data) return [];

    // Check if current user liked these pairings
    const pairingIds = data.map((p: any) => p.pairing_id);
    let likedPairingIds: string[] = [];

    if (currentUserId && pairingIds.length > 0) {
        const { data: likes } = await supabase
            .from('pairing_likes')
            .select('pairing_id')
            .eq('user_id', currentUserId)
            .in('pairing_id', pairingIds);

        likedPairingIds = likes?.map((l) => l.pairing_id) || [];
    }

    return data.map((pairing: any) => ({
        pairingId: pairing.pairing_id,
        userId: pairing.user_id,
        title: pairing.title,
        description: pairing.description,
        productIds: pairing.pairing_products
            .sort((a: PairingProductDB, b: PairingProductDB) => a.position - b.position)
            .map((pp: PairingProductDB) => pp.product_id),
        productThumbnails: [], // TODO: Get actual thumbnails
        likesCount: pairing.likes_count,
        isLikedByUser: likedPairingIds.includes(pairing.pairing_id),
        createdAt: pairing.created_at,
    }));
}

/**
 * Get pairing by ID with full product details
 */
export async function getPairingById(
    pairingId: string,
    currentUserId?: string
): Promise<Pairing | null> {
    const supabase = createClient();

    const { data: pairingData, error: pairingError } = await supabase
        .from('pairings')
        .select('*')
        .eq('pairing_id', pairingId)
        .single();

    if (pairingError || !pairingData) {
        console.error('Failed to fetch pairing:', pairingError);
        return null;
    }

    // Get product associations
    const { data: productAssocs, error: assocError } = await supabase
        .from('pairing_products')
        .select('product_id, position')
        .eq('pairing_id', pairingId)
        .order('position');

    if (assocError || !productAssocs) {
        console.error('Failed to fetch pairing products:', assocError);
        return null;
    }

    // Fetch full product details
    const productIds = productAssocs.map((pa) => pa.product_id);
    const { data: products, error: productsError } = await supabase
        .from('product_infos')
        .select(`
      *,
      production_infos(*),
      mandatory_nutrient_infos(*),
      nutrient_vitamin_infos(*),
      nutrient_mineral_infos(*)
    `)
        .in('id', productIds);

    if (productsError) {
        console.error('Failed to fetch products:', productsError);
        return null;
    }

    // Transform products (reuse from products.ts logic)
    const productsMap = new Map(
        products?.map((p) => [
            p.id,
            {
                id: p.id,
                title: p.title,
                manufacturer: p.manufacturer,
                category: p.category,
                subCategory: p.sub_category,
                contentVolume: p.content_volume,
                price: p.price,
                score: p.score,
                description: p.description,
                imageUrl: p.image_url,
                nutrition: {
                    calories: p.mandatory_nutrient_infos?.calories || 0,
                    carbohydrate: p.mandatory_nutrient_infos?.carbohydrate || 0,
                    sugars: p.mandatory_nutrient_infos?.sugars || 0,
                    dietaryFiber: p.mandatory_nutrient_infos?.dietary_fiber || 0,
                    protein: p.mandatory_nutrient_infos?.protein || 0,
                    fat: p.mandatory_nutrient_infos?.fat || 0,
                    saturatedFat: p.mandatory_nutrient_infos?.saturated_fat || 0,
                    transFat: p.mandatory_nutrient_infos?.trans_fat || 0,
                    cholesterol: p.mandatory_nutrient_infos?.cholesterol || 0,
                    sodium: p.mandatory_nutrient_infos?.sodium || 0,
                },
                createdAt: p.created_at,
                updatedAt: p.updated_at,
            } as Product,
        ]) || []
    );

    // Preserve order from pairing
    const orderedProducts = productAssocs
        .map((pa) => productsMap.get(pa.product_id))
        .filter((p): p is Product => p !== undefined);

    // Check if liked by current user
    let isLiked = false;
    if (currentUserId) {
        const { data: like } = await supabase
            .from('pairing_likes')
            .select('pairing_id')
            .eq('pairing_id', pairingId)
            .eq('user_id', currentUserId)
            .single();

        isLiked = !!like;
    }

    return {
        pairingId: pairingData.pairing_id,
        userId: pairingData.user_id,
        title: pairingData.title,
        description: pairingData.description,
        products: orderedProducts,
        likesCount: pairingData.likes_count,
        isLikedByUser: isLiked,
        createdAt: pairingData.created_at,
        updatedAt: pairingData.updated_at,
    };
}

/**
 * Create a new pairing
 */
export async function createPairing(
    data: CreatePairingRequest,
    userId: string
): Promise<Pairing> {
    const supabase = createClient();

    // Create pairing
    const { data: pairing, error: pairingError } = await supabase
        .from('pairings')
        .insert({
            user_id: userId,
            title: data.title.trim(),
            description: data.description?.trim() || null,
        })
        .select()
        .single();

    if (pairingError || !pairing) {
        console.error('Failed to create pairing:', pairingError);
        throw new Error('Failed to create pairing');
    }

    // Add products
    const productAssocs = data.productIds.map((productId, index) => ({
        pairing_id: pairing.pairing_id,
        product_id: productId,
        position: index + 1,
    }));

    const { error: assocError } = await supabase
        .from('pairing_products')
        .insert(productAssocs);

    if (assocError) {
        // Rollback: delete pairing
        await supabase.from('pairings').delete().eq('pairing_id', pairing.pairing_id);
        console.error('Failed to add products to pairing:', assocError);
        throw new Error('Failed to create pairing');
    }

    // Fetch and return created pairing
    const created = await getPairingById(pairing.pairing_id, userId);
    if (!created) {
        throw new Error('Failed to fetch created pairing');
    }

    return created;
}

/**
 * Update a pairing (owner only)
 */
export async function updatePairing(
    pairingId: string,
    data: UpdatePairingRequest,
    userId: string
): Promise<Pairing> {
    const supabase = createClient();

    // Update basic info if provided
    if (data.title || data.description !== undefined) {
        const updateData: any = {};
        if (data.title) updateData.title = data.title.trim();
        if (data.description !== undefined) {
            updateData.description = data.description?.trim() || null;
        }

        const { error } = await supabase
            .from('pairings')
            .update(updateData)
            .eq('pairing_id', pairingId)
            .eq('user_id', userId); // Ensure owner

        if (error) {
            console.error('Failed to update pairing:', error);
            throw new Error('Failed to update pairing');
        }
    }

    // Update products if provided
    if (data.productIds) {
        // Delete existing associations
        await supabase
            .from('pairing_products')
            .delete()
            .eq('pairing_id', pairingId);

        // Add new ones
        const productAssocs = data.productIds.map((productId, index) => ({
            pairing_id: pairingId,
            product_id: productId,
            position: index + 1,
        }));

        const { error: assocError } = await supabase
            .from('pairing_products')
            .insert(productAssocs);

        if (assocError) {
            console.error('Failed to update pairing products:', assocError);
            throw new Error('Failed to update pairing');
        }
    }

    const updated = await getPairingById(pairingId, userId);
    if (!updated) {
        throw new Error('Failed to fetch updated pairing');
    }

    return updated;
}

/**
 * Delete a pairing (owner only)
 */
export async function deletePairing(
    pairingId: string,
    userId: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('pairings')
        .delete()
        .eq('pairing_id', pairingId)
        .eq('user_id', userId); // Ensure owner

    if (error) {
        console.error('Failed to delete pairing:', error);
        return false;
    }

    return true;
}

/**
 * Toggle like on a pairing
 */
export async function togglePairingLike(
    pairingId: string,
    userId: string
): Promise<{ liked: boolean }> {
    const supabase = createClient();

    // Check if already liked
    const { data: existing } = await supabase
        .from('pairing_likes')
        .select('pairing_id')
        .eq('pairing_id', pairingId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        // Unlike
        const { error } = await supabase
            .from('pairing_likes')
            .delete()
            .eq('pairing_id', pairingId)
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to unlike pairing:', error);
            throw new Error('Failed to unlike pairing');
        }

        return { liked: false };
    } else {
        // Like
        const { error } = await supabase
            .from('pairing_likes')
            .insert({
                pairing_id: pairingId,
                user_id: userId,
            });

        if (error) {
            console.error('Failed to like pairing:', error);
            throw new Error('Failed to like pairing');
        }

        return { liked: true };
    }
}

/**
 * Get user's liked pairings
 */
export async function getUserLikedPairings(
    userId: string
): Promise<PairingSummary[]> {
    const supabase = createClient();

    const { data: likes, error } = await supabase
        .from('pairing_likes')
        .select('pairing_id')
        .eq('user_id', userId);

    if (error || !likes || likes.length === 0) {
        return [];
    }

    const pairingIds = likes.map((l) => l.pairing_id);

    // Use existing getAllPairings with these IDs
    const { data: pairings } = await supabase
        .from('pairings')
        .select(`
      pairing_id,
      user_id,
      title,
      description,
      likes_count,
      created_at,
      pairing_products (product_id, position)
    `)
        .in('pairing_id', pairingIds)
        .order('created_at', { ascending: false });

    if (!pairings) return [];

    return pairings.map((pairing: any) => ({
        pairingId: pairing.pairing_id,
        userId: pairing.user_id,
        title: pairing.title,
        description: pairing.description,
        productIds: pairing.pairing_products
            .sort((a: any, b: any) => a.position - b.position)
            .map((pp: any) => pp.product_id),
        productThumbnails: [],
        likesCount: pairing.likes_count,
        isLikedByUser: true,
        createdAt: pairing.created_at,
    }));
}
