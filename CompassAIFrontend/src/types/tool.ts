// 백엔드 DTO(AiToolResponse) ↔ 프론트 Tool 뷰 모델 호환
export type Tool = {
    id: number | string;          // ← DB id는 number, 과거 하드코딩은 string도 허용
    name: string;
    subTitle?: string;
    categories?: string[];        // 서버가 문자열 배열로 내려줌
    category?: string;            // (하위호환) 쓰진 않지만 남겨둠
    origin?: "국내" | "해외" | string;
    url?: string;
    logo?: string;                // "/xxx.png" (Frontend/public)
    long?: string;                // 서버의 description을 여기에 매핑해서 카드 UI 그대로 사용
    tags?: string[];              // (옵션)
};
