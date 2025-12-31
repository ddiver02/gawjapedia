/**
 * Supabase 데이터베이스 타입 정의
 * supabase gen types typescript 명령으로 자동 생성 가능
 * 
 * 현재는 수동으로 정의한 타입입니다
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    username: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    username?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    username?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            ratings: {
                Row: {
                    id: string;
                    user_id: string;
                    snack_id: string;
                    rating: number;
                    review: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    snack_id: string;
                    rating: number;
                    review?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    snack_id?: string;
                    rating?: number;
                    review?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            user_preferences: {
                Row: {
                    id: string;
                    user_id: string;
                    taste_preferences: Json;
                    preferred_tpo: Json;
                    nutrition_preferences: Json;
                    allergies: string[] | null;
                    preferred_categories: string[] | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    taste_preferences?: Json;
                    preferred_tpo?: Json;
                    nutrition_preferences?: Json;
                    allergies?: string[] | null;
                    preferred_categories?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    taste_preferences?: Json;
                    preferred_tpo?: Json;
                    nutrition_preferences?: Json;
                    allergies?: string[] | null;
                    preferred_categories?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            snack_ratings_summary: {
                Row: {
                    snack_id: string;
                    total_ratings: number;
                    average_rating: number;
                    last_rated_at: string;
                };
            };
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
