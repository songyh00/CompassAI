/* =========================================================
   0) DB & 기존 users 테이블 유지
   ========================================================= */
CREATE DATABASE IF NOT EXISTS compassai
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE compassai;

/* =========================================================
   1) 테이블 생성 (IF NOT EXISTS)
   ========================================================= */
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS category (
                                        id   BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        name VARCHAR(60) NOT NULL,
    CONSTRAINT uq_category_name UNIQUE (name)
    ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_tool (
                                       id            BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       name          VARCHAR(120) NOT NULL,
    sub_title     VARCHAR(200) NULL,
    origin        VARCHAR(30)  NULL,
    url           VARCHAR(300) NULL,  -- NULL 허용 (UNIQUE는 NULL 여러개 허용)
    logo          VARCHAR(300) NULL,
    description   TEXT         NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_ai_tool_name UNIQUE (name),
    CONSTRAINT uq_ai_tool_url  UNIQUE (url)
    ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_tool_category (
                                                tool_id     BIGINT NOT NULL,
                                                category_id BIGINT NOT NULL,
                                                PRIMARY KEY (tool_id, category_id),
    CONSTRAINT fk_atc_tool     FOREIGN KEY (tool_id)     REFERENCES ai_tool(id)     ON DELETE CASCADE,
    CONSTRAINT fk_atc_category FOREIGN KEY (category_id) REFERENCES category(id)    ON DELETE CASCADE
    ) ENGINE=InnoDB;

/* =========================================================
   2) 카테고리 라벨 입력 (중복 무시)
   ========================================================= */
INSERT IGNORE INTO category(name) VALUES
('글쓰기/콘텐츠'),
('디자인/아트'),
('비디오/오디오'),
('생산성/협업도구'),
('교육/학습'),
('개발/프로그래밍'),
('비즈니스/마케팅'),
('검색/데이터'),
('엔터테인먼트/기타'),
('게임'),
('일상생활형 서비스');

/* =========================================================
   3) TOOLS 18개 입력 (이름 기준 upsert)
   ========================================================= */
INSERT INTO ai_tool (name, sub_title, origin, url, logo, description) VALUES
                                                                          ('챗지피티 (ChatGPT)','대화형 AI','해외','https://chatgpt.com/','/gpt.png','OpenAI에서 개발한 자연어 처리 기반의 대화형 AI 모델로, 다양한 주제에 대해 인간과 유사한 대화를 제공합니다.'),
                                                                          ('제미나이 (Gemini)','Google의 대화형 AI 어시스턴트','해외','https://gemini.google.com/','/gemini.png','Gemini는 Google의 최신 AI모델을 기반으로, 사용자가 글쓰기, 계획 수립, 학습 등 다양한 작업을 효율적으로 수행할 수 있도록 돕는 대화형 어시스턴트입니다.'),
                                                                          ('클로드 (Claude)','대화형 어시스턴트','해외','https://claude.ai/','/claude.png','Claude는 Anthropic에서 개발한 고급 AI 대화 모델입니다. 사용자와의 자연스러운 대화를 통해 다양한 작업을 수행할 수 있으며, 정보 제공, 질문 답변, 창의적 작업 지원 등 광범위한 기능을 제공합니다.'),
                                                                          ('퍼플렉시티 (Perplexity AI)','인공지능 기반의 검색 엔진','해외','https://www.perplexity.ai/','/perplexity.png','인공지능을 활용한 실시간 검색 엔진으로, 사용자의 질문에 대해 정확하고 신뢰할 수 있는 답변을 제공합니다.'),
                                                                          ('미드저니 (Midjourney)','이미지 생성 플랫폼','해외','https://www.midjourney.com/','/midjourney.png','미드저니는 텍스트 설명을 기반으로 이미지를 생성하는 AI 플랫폼으로, 사용자가 입력한 텍스트를 바탕으로 독창적인 이미지를 생성합니다.'),
                                                                          ('뤼튼 (Wrtn)','생성형 AI','국내','https://wrtn.ai/','/wrtn.png','AI 기반의 글쓰기 및 이미지 생성 도구로, 블로그 포스팅, 광고 카피, 이메일 작성 등 다양한 콘텐츠를 자동으로 생성합니다.'),
                                                                          ('딥툰 (DeepToon)','웹툰 제작 플랫폼','국내','https://www.deeptoon.com/','/deeptoon.png','딥툰은 인공지능을 활용하여 사용자가 제공한 시나리오와 콘티를 바탕으로 웹툰을 자동으로 생성합니다.'),
                                                                          ('애니메이티드 드로잉스 (Animated Drawings)','인공지능 기반 그림 애니메이션 도구','해외','https://sketch.metademolab.com/','/anidrawing.png','사용자가 그린 캐릭터 그림을 업로드하면, 인공지능이 해당 캐릭터를 인식하고 다양한 동작을 부여하여 애니메이션으로 제공합니다.'),
                                                                          ('수노 (Suno)','음악 생성 플랫폼','해외','https://suno.com/','/suno.png','Suno는 AI 기술을 이용해 사용자가 입력한 주제나 아이디어를 기반으로 가사와 멜로디를 포함한 노래를 생성합니다.'),
                                                                          ('AI 스튜디오스 (AI STUDIOS)','가상인간 영상합성 플랫폼','국내','https://aistudios.com/','/aistudios.png','AI STUDIOS는 사용자가 입력한 텍스트를 기반으로 실제 사람과 유사한 AI 가상인간 영상을 제작하여 제공합니다.'),
                                                                          ('픽토리 (Pictory)','동영상 제작 플랫폼','해외','https://pictory.ai/','/pictory.png','픽토리는 AI를 활용하여 텍스트, URL, 미디어 파일을 기반으로 전문적인 동영상을 신속하게 생성합니다.'),
                                                                          ('소라 (Sora)','텍스트 기반 비디오 생성 모델','해외','https://openai.com/sora','/gpt.png','Sora는 OpenAI에서 개발한 AI 모델로, 사용자가 입력한 텍스트 설명을 기반으로 최대 1분 길이의 고품질 비디오를 생성합니다.'),
                                                                          ('챗피디에프 (ChatPDF)','PDF를 업로드하여 질의 응답','해외','https://www.chatpdf.com/','/chatpdf.png','ChatPDF는 PDF 파일을 업로드하면 AI가 문서를 분석해 자연어로 질문에 답변합니다.'),
                                                                          ('신세시아 (Synthesia)','동영상 제작 플랫폼','해외','https://www.synthesia.io/','/synthesia.png','신세시아는 인공지능을 활용하여 텍스트를 다양한 언어와 아바타를 활용한 동영상으로 변환하여 제공합니다.'),
                                                                          ('MS 코파일럿 (Microsoft Copilot)','디지털 어시스턴트 및 생산성 도구','해외','https://copilot.microsoft.com/','/ms.png','Microsoft Copilot은 GPT-4 기반의 AI 챗봇으로, Microsoft 365 앱과 통합되어 문서 작성, 데이터 분석, 프레젠테이션 생성, 코딩 지원 등 광범위한 기능을 제공합니다.'),
                                                                          ('깃허브 코파일럿 (GitHub Copilot)','코드 작성 도우미','해외','https://github.com/features/copilot','/git.png','GitHub Copilot은 GitHub와 OpenAI가 공동 개발한 AI 기반 코드 작성 도우미로, 개발자의 생산성을 높이고 코드 작성 속도를 가속화하는 도구입니다.'),
                                                                          ('AI 던전 (AI Dungeon)','AI 기반 텍스트 어드벤처 게임','해외','https://play.aidungeon.io/','/aidungeon.png','AI Dungeon은 사용자가 자유롭게 입력한 텍스트에 따라 인공지능이 실시간으로 무한한 스토리를 생성하는 인터랙티브 텍스트 어드벤처 게임입니다.'),
                                                                          ('미타 (meeta)','약속장소 추천 AI','국내',NULL,'/meeta.png','meeta는 다중 사용자에게 다중 조건을 입력받아 최적의 약속장소를 추천해주는 AI서비스입니다.')
    AS new
ON DUPLICATE KEY UPDATE
                     sub_title   = new.sub_title,
                     origin      = new.origin,
                     url         = new.url,
                     logo        = new.logo,
                     description = new.description;

/* =========================================================
   4) 이름 기반 카테고리 매핑 (중복 무시)
   ========================================================= */
-- 유틸 CTE 없이 간단한 다건 INSERT … SELECT

-- ChatGPT
INSERT IGNORE INTO ai_tool_category
SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='글쓰기/콘텐츠'   WHERE t.name='챗지피티 (ChatGPT)';
INSERT IGNORE INTO ai_tool_category
SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구' WHERE t.name='챗지피티 (ChatGPT)';
INSERT IGNORE INTO ai_tool_category
SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='교육/학습'       WHERE t.name='챗지피티 (ChatGPT)';
INSERT IGNORE INTO ai_tool_category
SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='개발/프로그래밍' WHERE t.name='챗지피티 (ChatGPT)';
INSERT IGNORE INTO ai_tool_category
SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='검색/데이터'     WHERE t.name='챗지피티 (ChatGPT)';

-- Gemini
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='글쓰기/콘텐츠'      WHERE t.name='제미나이 (Gemini)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구'    WHERE t.name='제미나이 (Gemini)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='검색/데이터'        WHERE t.name='제미나이 (Gemini)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비즈니스/마케팅'    WHERE t.name='제미나이 (Gemini)';

-- Claude
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='글쓰기/콘텐츠'      WHERE t.name='클로드 (Claude)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구'    WHERE t.name='클로드 (Claude)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='개발/프로그래밍'    WHERE t.name='클로드 (Claude)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='검색/데이터'        WHERE t.name='클로드 (Claude)';

-- Perplexity
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='글쓰기/콘텐츠'      WHERE t.name='퍼플렉시티 (Perplexity AI)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='교육/학습'          WHERE t.name='퍼플렉시티 (Perplexity AI)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='검색/데이터'        WHERE t.name='퍼플렉시티 (Perplexity AI)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구'    WHERE t.name='퍼플렉시티 (Perplexity AI)';

-- Midjourney
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='디자인/아트'        WHERE t.name='미드저니 (Midjourney)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구'    WHERE t.name='미드저니 (Midjourney)';

-- Wrtn
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='디자인/아트'        WHERE t.name='뤼튼 (Wrtn)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비즈니스/마케팅'    WHERE t.name='뤼튼 (Wrtn)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='글쓰기/콘텐츠'      WHERE t.name='뤼튼 (Wrtn)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구'    WHERE t.name='뤼튼 (Wrtn)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='검색/데이터'        WHERE t.name='뤼튼 (Wrtn)';

-- DeepToon
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='디자인/아트'        WHERE t.name='딥툰 (DeepToon)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='글쓰기/콘텐츠'      WHERE t.name='딥툰 (DeepToon)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구'    WHERE t.name='딥툰 (DeepToon)';

-- Animated Drawings
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='디자인/아트'        WHERE t.name='애니메이티드 드로잉스 (Animated Drawings)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='교육/학습'          WHERE t.name='애니메이티드 드로잉스 (Animated Drawings)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비디오/오디오'      WHERE t.name='애니메이티드 드로잉스 (Animated Drawings)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='엔터테인먼트/기타'  WHERE t.name='애니메이티드 드로잉스 (Animated Drawings)';

-- Suno
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비디오/오디오'      WHERE t.name='수노 (Suno)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='엔터테인먼트/기타'  WHERE t.name='수노 (Suno)';

-- AI STUDIOS
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비디오/오디오'      WHERE t.name='AI 스튜디오스 (AI STUDIOS)';

-- Pictory
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비디오/오디오'      WHERE t.name='픽토리 (Pictory)';

-- Sora
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비디오/오디오'      WHERE t.name='소라 (Sora)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='엔터테인먼트/기타'  WHERE t.name='소라 (Sora)';

-- ChatPDF
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='교육/학습'          WHERE t.name='챗피디에프 (ChatPDF)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비즈니스/마케팅'    WHERE t.name='챗피디에프 (ChatPDF)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='글쓰기/콘텐츠'      WHERE t.name='챗피디에프 (ChatPDF)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구'    WHERE t.name='챗피디에프 (ChatPDF)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='검색/데이터'        WHERE t.name='챗피디에프 (ChatPDF)';

-- Synthesia
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비즈니스/마케팅'    WHERE t.name='신세시아 (Synthesia)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='엔터테인먼트/기타'  WHERE t.name='신세시아 (Synthesia)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='비디오/오디오'      WHERE t.name='신세시아 (Synthesia)';

-- Microsoft Copilot
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='개발/프로그래밍'    WHERE t.name='MS 코파일럿 (Microsoft Copilot)';
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='생산성/협업도구'    WHERE t.name='MS 코파일럿 (Microsoft Copilot)';

-- GitHub Copilot
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='개발/프로그래밍'    WHERE t.name='깃허브 코파일럿 (GitHub Copilot)';

-- AI Dungeon
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='게임'               WHERE t.name='AI 던전 (AI Dungeon)';

-- meeta
INSERT IGNORE INTO ai_tool_category SELECT t.id, c.id FROM ai_tool t JOIN category c ON c.name='일상생활형 서비스'   WHERE t.name='미타 (meeta)';

/* =========================================================
   5) 검증
   ========================================================= */
SHOW TABLES;
SELECT COUNT(*) AS tool_count     FROM ai_tool;
SELECT COUNT(*) AS category_count FROM category;
SELECT COUNT(*) AS mapping_count  FROM ai_tool_category;

-- 각 툴의 카테고리 묶음 확인
SELECT t.name AS tool, GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ', ') AS categories
FROM ai_tool t
         JOIN ai_tool_category tc ON tc.tool_id = t.id
         JOIN category c ON c.id = tc.category_id
GROUP BY t.id
ORDER BY t.name;
