// src/data/tools.ts
import type { Tool } from "../types/tool";

/**
 * NOTE
 * - 같은 AI는 하나의 항목으로 통합하고, 여러 카테고리는 `categories` 배열에 넣었습니다.
 * - 카테고리 라벨은 아래 값만 사용합니다.
 *   "글쓰기/콘텐츠" | "디자인/아트" | "비디오/오디오" | "생산성/협업도구"
 *   | "교육/학습" | "개발/프로그래밍" | "비즈니스/마케팅" | "검색/데이터"
 *   | "엔터테인먼트/기타" | "게임" | "일상생활형 서비스"
 */
export const TOOLS: Tool[] = [
    {
        id: "1",
        name: "챗지피티 (ChatGPT)",
        subTitle: "대화형 AI",
        categories: ["글쓰기/콘텐츠", "생산성/협업도구", "교육/학습", "개발/프로그래밍", "검색/데이터"],
        origin: "해외",
        url: "https://chatgpt.com/",
        logo: "/gpt.png",
        long:
            "OpenAI에서 개발한 자연어 처리 기반의 대화형 AI 모델로, 다양한 주제에 대해 인간과 유사한 대화를 제공합니다.",
    },
    {
        id: "2",
        name: "제미나이 (Gemini)",
        subTitle: "Google의 대화형 AI 어시스턴트",
        categories: ["글쓰기/콘텐츠", "생산성/협업도구", "검색/데이터", "비즈니스/마케팅"],
        origin: "해외",
        url: "https://gemini.google.com/",
        logo: "/gemini.png",
        long:
            "Gemini는 Google의 최신 AI모델을 기반으로, 사용자가 글쓰기, 계획 수립, 학습 등 다양한 작업을 효율적으로 수행할 수 있도록 돕는 대화형 어시스턴트입니다.",
    },
    {
        id: "3",
        name: "클로드 (Claude)",
        subTitle: "대화형 어시스턴트",
        categories: ["글쓰기/콘텐츠", "생산성/협업도구", "개발/프로그래밍", "검색/데이터"],
        origin: "해외",
        url: "https://claude.ai/",
        logo: "/claude.png",
        long:
            "Claude는 Anthropic에서 개발한 고급 AI 대화 모델입니다. 사용자와의 자연스러운 대화를 통해 다양한 작업을 수행할 수 있으며, 정보 제공, 질문 답변, 창의적 작업 지원 등 광범위한 기능을 제공합니다.",
    },
    {
        id: "4",
        name: "퍼플렉시티 (Perplexity AI)",
        subTitle: "인공지능 기반의 검색 엔진",
        categories: ["글쓰기/콘텐츠", "교육/학습", "검색/데이터", "생산성/협업도구"],
        origin: "해외",
        url: "https://www.perplexity.ai/",
        logo: "/perplexity.png",
        long:
            "인공지능을 활용한 실시간 검색 엔진으로, 사용자의 질문에 대해 정확하고 신뢰할 수 있는 답변을 제공합니다.",
    },
    {
        id: "5",
        name: "미드저니 (Midjourney)",
        subTitle: "이미지 생성 플랫폼",
        categories: ["디자인/아트", "생산성/협업도구"],
        origin: "해외",
        url: "https://www.midjourney.com/",
        logo: "/midjourney.png",
        long:
            "미드저니는 텍스트 설명을 기반으로 이미지를 생성하는 AI 플랫폼으로, 사용자가 입력한 텍스트를 바탕으로 독창적인 이미지를 생성합니다.",
    },
    {
        id: "6",
        name: "뤼튼 (Wrtn)",
        subTitle: "생성형 AI",
        categories: ["디자인/아트", "비즈니스/마케팅", "글쓰기/콘텐츠", "생산성/협업도구", "검색/데이터"],
        origin: "국내",
        url: "https://wrtn.ai/",
        logo: "/wrtn.png",
        long:
            "AI 기반의 글쓰기 및 이미지 생성 도구로, 블로그 포스팅, 광고 카피, 이메일 작성 등 다양한 콘텐츠를 자동으로 생성합니다.",
    },
    {
        id: "7",
        name: "딥툰 (DeepToon)",
        subTitle: "웹툰 제작 플랫폼",
        categories: ["디자인/아트", "글쓰기/콘텐츠", "생산성/협업도구"],
        origin: "국내",
        url: "https://www.deeptoon.com/",
        logo: "/deeptoon.png",
        long:
            "딥툰은 인공지능을 활용하여 사용자가 제공한 시나리오와 콘티를 바탕으로 웹툰을 자동으로 생성합니다.",
    },
    {
        id: "8",
        name: "애니메이티드 드로잉스 (Animated Drawings)",
        subTitle: "인공지능 기반 그림 애니메이션 도구",
        categories: ["디자인/아트", "교육/학습", "비디오/오디오", "엔터테인먼트/기타"],
        origin: "해외",
        url: "https://sketch.metademolab.com/",
        logo: "/anidrawing.png",
        long:
            "사용자가 그린 캐릭터 그림을 업로드하면, 인공지능이 해당 캐릭터를 인식하고 다양한 동작을 부여하여 애니메이션으로 제공합니다.",
    },
    {
        id: "9",
        name: "수노 (Suno)",
        subTitle: "음악 생성 플랫폼",
        categories: ["비디오/오디오", "엔터테인먼트/기타"],
        origin: "해외",
        url: "https://suno.com/",
        logo: "/suno.png",
        long:
            "Suno는 AI 기술을 이용해 사용자가 입력한 주제나 아이디어를 기반으로 가사와 멜로디를 포함한 노래를 생성합니다.",
    },
    {
        id: "10",
        name: "AI 스튜디오스 (AI STUDIOS)",
        subTitle: "가상인간 영상합성 플랫폼",
        categories: ["비디오/오디오"],
        origin: "국내",
        url: "https://aistudios.com/",
        logo: "/aistudios.png",
        long:
            "AI STUDIOS는 사용자가 입력한 텍스트를 기반으로 실제 사람과 유사한 AI 가상인간 영상을 제작하여 제공합니다.",
    },
    {
        id: "11",
        name: "픽토리 (Pictory)",
        subTitle: "동영상 제작 플랫폼",
        categories: ["비디오/오디오"],
        origin: "해외",
        url: "https://pictory.ai/",
        logo: "/pictory.png",
        long:
            "픽토리는 AI를 활용하여 텍스트, URL, 미디어 파일을 기반으로 전문적인 동영상을 신속하게 생성합니다.",
    },
    {
        id: "12",
        name: "소라 (Sora)",
        subTitle: "텍스트 기반 비디오 생성 모델",
        categories: ["비디오/오디오", "엔터테인먼트/기타"],
        origin: "해외",
        url: "https://openai.com/sora",
        logo: "/gpt.png",
        long:
            "Sora는 OpenAI에서 개발한 AI 모델로, 사용자가 입력한 텍스트 설명을 기반으로 최대 1분 길이의 고품질 비디오를 생성합니다.",
    },
    {
        id: "13",
        name: "챗피디에프 (ChatPDF)",
        subTitle: "PDF를 업로드하여 질의 응답",
        categories: ["교육/학습", "비즈니스/마케팅", "글쓰기/콘텐츠", "생산성/협업도구", "검색/데이터"],
        origin: "해외",
        url: "https://www.chatpdf.com/",
        logo: "/chatpdf.png",
        long:
            "ChatPDF는 PDF 파일을 업로드하면 AI가 문서를 분석해 자연어로 질문에 답변합니다.",
    },
    {
        id: "14",
        name: "신세시아 (Synthesia)",
        subTitle: "동영상 제작 플랫폼",
        categories: ["비즈니스/마케팅", "엔터테인먼트/기타", "비디오/오디오"],
        origin: "해외",
        url: "https://www.synthesia.io/",
        logo: "/synthesia.png",
        long:
            "신세시아는 인공지능을 활용하여 텍스트를 다양한 언어와 아바타를 활용한 동영상으로 변환하여 제공합니다.",
    },
    {
        id: "15",
        name: "MS 코파일럿 (Microsoft Copilot)",
        subTitle: "디지털 어시스턴트 및 생산성 도구",
        categories: ["개발/프로그래밍", "생산성/협업도구"],
        origin: "해외",
        url: "https://copilot.microsoft.com/",
        logo: "/ms.png",
        long:
            "Microsoft Copilot은 GPT-4 기반의 AI 챗봇으로, Microsoft 365 앱과 통합되어 문서 작성, 데이터 분석, 프레젠테이션 생성, 코딩 지원 등 광범위한 기능을 제공합니다.",
    },
    {
        id: "16",
        name: "깃허브 코파일럿 (GitHub Copilot)",
        subTitle: "코드 작성 도우미",
        categories: ["개발/프로그래밍"],
        origin: "해외",
        url: "https://github.com/features/copilot",
        logo: "/git.png",
        long:
            "GitHub Copilot은 GitHub와 OpenAI가 공동 개발한 AI 기반 코드 작성 도우미로, 개발자의 생산성을 높이고 코드 작성 속도를 가속화하는 도구입니다.",
    },
    {
        id: "17",
        name: "AI 던전 (AI Dungeon)",
        subTitle: "AI 기반 텍스트 어드벤처 게임",
        categories: ["게임"],
        origin: "해외",
        url: "https://play.aidungeon.io/",
        logo: "/aidungeon.png",
        long:
            "AI Dungeon은 사용자가 자유롭게 입력한 텍스트에 따라 인공지능이 실시간으로 무한한 스토리를 생성하는 인터랙티브 텍스트 어드벤처 게임입니다.",
    },
    {
        id: "18",
        name: "미타 (meeta)",
        subTitle: "약속장소 추천 AI",
        categories: ["일상생활형 서비스"],
        origin: "국내",
        url: "",
        logo: "/meeta.png",
        long:
            "meeta는 다중 사용자에게 다중 조건을 입력받아 최적의 약속장소를 추천해주는 AI서비스입니다.",
    }
];
