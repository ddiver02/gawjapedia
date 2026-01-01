import { google } from 'googleapis';
import { Snack, SnackRawData, NutritionInfo, SnackCategory } from '@/types/snack';

/**
 * Google Sheets API 클라이언트 초기화
 * 서비스 계정 인증 사용
 */
function getGoogleSheetsClient() {
    // 환경 변수 검증
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error(
            'Google Sheets 환경 변수가 설정되지 않았습니다. ' +
            'GOOGLE_SERVICE_ACCOUNT_EMAIL과 GOOGLE_PRIVATE_KEY를 확인하세요.'
        );
    }

    // 개행 문자 처리: Vercel 등에서 환경 변수로 전달 시 \\n이 문자열로 들어올 수 있음
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    // JWT 인증 클라이언트 생성
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        undefined,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    // Sheets API 클라이언트 반환
    return google.sheets({ version: 'v4', auth });
}

/**
 * 숫자 변환 헬퍼 함수
 * Google Sheets에서 가져온 값이 문자열일 수 있으므로 안전하게 숫자로 변환
 */
function toNumber(value: string | number | undefined): number {
    if (value === undefined || value === null || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
}

/**
 * 원시 데이터를 Snack 객체로 변환
 * Google Sheets의 한글 컬럼명을 영문 프로퍼티로 매핑
 */
function transformRawDataToSnack(raw: SnackRawData): Snack {
    const nutrition: NutritionInfo = {
        calories: toNumber(raw['열량(Kcal)']),
        sodium: toNumber(raw['나트륨 (mg)']),
        carbohydrate: toNumber(raw['탄수화물 (g)']),
        dietaryFiber: toNumber(raw['식이섬유']),
        sugars: toNumber(raw['당류 (g)']),
        fat: toNumber(raw['지방']),
        transFat: toNumber(raw['트랜스지방']),
        saturatedFat: toNumber(raw['포화지방']),
        cholesterol: toNumber(raw['콜레스테롤']),
        protein: toNumber(raw['단백질']),
        lactose: toNumber(raw['유당']),
        calcium: toNumber(raw['칼슘']),
        iron: toNumber(raw['철분']),
        zinc: toNumber(raw['아연']),
        magnesium: toNumber(raw['마그네슘']),
        vitaminA: toNumber(raw['비타민A']),
        vitaminB1: toNumber(raw['비타민B1']),
        vitaminB2: toNumber(raw['비타민B2']),
        vitaminB6: toNumber(raw['비타민B6']),
        vitaminC: toNumber(raw['비타민C']),
        vitaminE: toNumber(raw['비타민E']),
        niacin: toNumber(raw['나이아신']),
        pantothenicAcid: toNumber(raw['판토텐산']),
        folicAcid: toNumber(raw['엽산']),
    };

    return {
        id: raw.id,
        name: raw.상품명,
        manufacturer: raw.제조원,
        category: raw.분류 as SnackCategory,
        category2: raw.분류2,
        category3: raw.분류3,
        contentVolume: raw.내용량,
        price: toNumber(raw['가격(원)'] || raw.가격),
        score: toNumber(raw.점수),
        description: raw.설명 || '',
        nutrition,
    };
}

/**
 * Google Sheets에서 전체 간식 목록을 가져옵니다
 * 
 * @param sheetName - 시트 이름 (기본값: 'Sheet1')
 * @returns Snack 배열
 * 
 * @example
 * ```typescript
 * const snacks = await fetchSnacksFromSheet();
 * console.log(`총 ${snacks.length}개의 간식을 불러왔습니다`);
 * ```
 */
export async function fetchSnacksFromSheet(sheetName: string = 'Sheet1'): Promise<Snack[]> {
    try {
        const sheets = getGoogleSheetsClient();
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

        if (!spreadsheetId) {
            throw new Error('GOOGLE_SHEETS_ID 환경 변수가 설정되지 않았습니다.');
        }

        // 전체 데이터 범위 읽기 (A1부터 끝까지)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:AC`, // A열부터 AC열까지 (29개 컬럼)
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            console.warn('Google Sheets에서 데이터를 찾을 수 없습니다.');
            return [];
        }

        // 첫 번째 행은 헤더, 나머지는 데이터
        const [headers, ...dataRows] = rows;

        // 각 행을 객체로 변환
        const snacks: Snack[] = dataRows
            .filter(row => row.length > 0 && row[0]) // 빈 행 제외
            .map(row => {
                // 행 데이터를 헤더와 매핑하여 객체 생성
                const rawData: any = {};
                headers.forEach((header, index) => {
                    rawData[header] = row[index] || '';
                });
                return transformRawDataToSnack(rawData as SnackRawData);
            });

        console.log(`✅ Google Sheets에서 ${snacks.length}개의 간식 데이터를 성공적으로 불러왔습니다.`);
        return snacks;

    } catch (error) {
        console.error('❌ Google Sheets 데이터 로드 실패:', error);

        // 에러 타입별 상세 메시지
        if (error instanceof Error) {
            if (error.message.includes('credentials')) {
                throw new Error('Google Sheets API 인증 실패. 서비스 계정 설정을 확인하세요.');
            } else if (error.message.includes('not found')) {
                throw new Error('스프레드시트를 찾을 수 없습니다. GOOGLE_SHEETS_ID를 확인하세요.');
            } else if (error.message.includes('permission')) {
                throw new Error('스프레드시트 접근 권한이 없습니다. 서비스 계정과 시트를 공유했는지 확인하세요.');
            }
        }

        throw error;
    }
}

/**
 * ID로 특정 간식 정보를 가져옵니다
 * 
 * @param id - 간식 ID
 * @returns Snack 객체 또는 null (찾지 못한 경우)
 * 
 * @example
 * ```typescript
 * const snack = await fetchSnackById('1');
 * if (snack) {
 *   console.log(`찾은 간식: ${snack.name}`);
 * }
 * ```
 */
export async function fetchSnackById(id: string): Promise<Snack | null> {
    try {
        const allSnacks = await fetchSnacksFromSheet();
        const snack = allSnacks.find(s => s.id === id);

        if (!snack) {
            console.warn(`⚠️ ID '${id}'에 해당하는 간식을 찾을 수 없습니다.`);
            return null;
        }

        return snack;
    } catch (error) {
        console.error(`❌ 간식 ID '${id}' 조회 실패:`, error);
        throw error;
    }
}

/**
 * 카테고리별 간식 목록을 가져옵니다
 * 
 * @param category - 간식 카테고리
 * @returns 해당 카테고리의 Snack 배열
 */
export async function fetchSnacksByCategory(category: SnackCategory): Promise<Snack[]> {
    try {
        const allSnacks = await fetchSnacksFromSheet();
        return allSnacks.filter(snack => snack.category === category);
    } catch (error) {
        console.error(`❌ 카테고리 '${category}' 조회 실패:`, error);
        throw error;
    }
}

/**
 * 간식 검색 (상품명 또는 제조원)
 * 
 * @param query - 검색어
 * @returns 검색 결과 Snack 배열
 */
export async function searchSnacks(query: string): Promise<Snack[]> {
    try {
        const allSnacks = await fetchSnacksFromSheet();
        const lowerQuery = query.toLowerCase();

        return allSnacks.filter(snack =>
            snack.name.toLowerCase().includes(lowerQuery) ||
            snack.manufacturer.toLowerCase().includes(lowerQuery)
        );
    } catch (error) {
        console.error(`❌ 간식 검색 '${query}' 실패:`, error);
        throw error;
    }
}
