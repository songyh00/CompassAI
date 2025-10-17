export type Tool = {
    id: string;
    name: string;
    subTitle?: string;

    /** 신규 권장: 여러 카테고리 */
    categories?: string[];

    /** 구형 데이터 하위호환: 단일 카테고리 */
    category?: string;

    origin?: "국내" | "해외" | string;
    url?: string;
    logo?: string;
    long?: string;

    // 선택: 해시태그 등
    tags?: string[];
};
