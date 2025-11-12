// 페이지 응답 공통 타입 (Spring Data Page)
export type Page<T> = {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
};
