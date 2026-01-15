#!/usr/bin/env ts-node

/**
 * Google Sheets → Supabase Migration Script
 * 
 * Google Sheets의 간식 데이터를 Supabase product 테이블로 마이그레이션합니다.
 * 
 * 사용법:
 * npx tsx scripts/migrate-sheets-to-supabase.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 로드
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { fetchSnacksFromSheet } from '../lib/googleSheets';

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
    console.log('🚀 Google Sheets → Supabase 마이그레이션 시작\n');

    try {
        // 1. Google Sheets 데이터 가져오기
        console.log('📊 Step 1: Google Sheets 데이터 로드 중...');
        const snacks = await fetchSnacksFromSheet();
        console.log(`✅ ${snacks.length}개의 제품 데이터를 불러왔습니다.\n`);

        if (snacks.length === 0) {
            console.log('⚠️  데이터가 없습니다. 마이그레이션을 중단합니다.');
            return;
        }

        // 2. 기존 데이터 삭제 (옵션)
        console.log('🗑️  Step 2: 기존 데이터 정리 중...');
        const { error: deleteError } = await supabase
            .from('product_infos')
            .delete()
            .neq('id', ''); // 모든 행 삭제

        if (deleteError) {
            console.warn('⚠️  기존 데이터 삭제 실패 (테이블이 비어있을 수 있음):', deleteError.message);
        } else {
            console.log('✅ 기존 데이터 정리 완료\n');
        }

        // 3. 데이터 변환 및 삽입
        console.log('💾 Step 3: Supabase에 데이터 삽입 중...');

        let successCount = 0;
        let errorCount = 0;

        for (const snack of snacks) {
            try {
                // 3-1. product_infos 삽입
                const { error: productError } = await supabase
                    .from('product_infos')
                    .insert({
                        id: snack.id,
                        title: snack.name,
                        manufacturer: snack.manufacturer,
                        category: snack.category,
                        sub_category: snack.category2 || null,
                        content_volume: snack.contentVolume,
                        price: snack.price,
                        score: snack.score,
                        description: snack.description || null,
                    });

                if (productError) throw productError;

                // 3-2. production_infos 삽입
                const { error: productionError } = await supabase
                    .from('production_infos')
                    .insert({
                        product_id: snack.id,
                        maker: snack.manufacturer,
                    });

                if (productionError) throw productionError;

                // 3-3. mandatory_nutrient_infos 삽입
                const { error: nutrientError } = await supabase
                    .from('mandatory_nutrient_infos')
                    .insert({
                        product_id: snack.id,
                        calories: snack.nutrition.calories,
                        carbohydrate: snack.nutrition.carbohydrate,
                        sugars: snack.nutrition.sugars,
                        dietary_fiber: snack.nutrition.dietaryFiber,
                        protein: snack.nutrition.protein,
                        fat: snack.nutrition.fat,
                        saturated_fat: snack.nutrition.saturatedFat,
                        trans_fat: snack.nutrition.transFat,
                        cholesterol: snack.nutrition.cholesterol,
                        sodium: snack.nutrition.sodium,
                    });

                if (nutrientError) throw nutrientError;

                // 3-4. nutrient_vitamin_infos 삽입
                const { error: vitaminError } = await supabase
                    .from('nutrient_vitamin_infos')
                    .insert({
                        product_id: snack.id,
                        vitamin_a: snack.nutrition.vitaminA || null,
                        vitamin_b1: snack.nutrition.vitaminB1 || null,
                        vitamin_b2: snack.nutrition.vitaminB2 || null,
                        vitamin_b6: snack.nutrition.vitaminB6 || null,
                        vitamin_c: snack.nutrition.vitaminC || null,
                        vitamin_e: snack.nutrition.vitaminE || null,
                        niacin: snack.nutrition.niacin || null,
                        pantothenic_acid: snack.nutrition.pantothenicAcid || null,
                        folate: snack.nutrition.folicAcid || null,
                    });

                if (vitaminError) throw vitaminError;

                // 3-5. nutrient_mineral_infos 삽입
                const { error: mineralError } = await supabase
                    .from('nutrient_mineral_infos')
                    .insert({
                        product_id: snack.id,
                        calcium: snack.nutrition.calcium || null,
                        iron: snack.nutrition.iron || null,
                        zinc: snack.nutrition.zinc || null,
                        magnesium: snack.nutrition.magnesium || null,
                    });

                if (mineralError) throw mineralError;

                successCount++;
                process.stdout.write(`\r✅ ${successCount}/${snacks.length} 제품 마이그레이션 완료`);
            } catch (error) {
                errorCount++;
                console.error(`\n❌ 제품 ID ${snack.id} (${snack.name}) 마이그레이션 실패:`, error);
            }
        }

        console.log('\n');
        console.log('🎉 마이그레이션 완료!');
        console.log(`✅ 성공: ${successCount}개`);
        console.log(`❌ 실패: ${errorCount}개`);

        // 4. 검증
        console.log('\n🔍 Step 4: 데이터 검증 중...');
        const { count, error: countError } = await supabase
            .from('product_infos')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ 검증 실패:', countError.message);
        } else {
            console.log(`✅ Supabase에 ${count}개의 제품이 저장되어 있습니다.`);
        }

    } catch (error) {
        console.error('\n❌ 마이그레이션 중 오류 발생:', error);
        process.exit(1);
    }
}

// 실행
migrateData()
    .then(() => {
        console.log('\n✅ 모든 작업이 완료되었습니다!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 치명적 오류:', error);
        process.exit(1);
    });
