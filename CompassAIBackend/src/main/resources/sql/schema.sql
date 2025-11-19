/* =========================================================
   schema.sql
   - DB 및 테이블 생성용 (DDL 전용)
   ========================================================= */

CREATE DATABASE IF NOT EXISTS compassai
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE compassai;

/* -----------------------------
   1) users: 기본 유저 테이블
      - role: USER / ADMIN
   ----------------------------- */
CREATE TABLE IF NOT EXISTS users (
                                     id         BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     name       VARCHAR(50)  NOT NULL,
                                     email      VARCHAR(100) NOT NULL UNIQUE,
                                     password   VARCHAR(255) NOT NULL,
                                     role       ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',  -- 권한
                                     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP    -- 생성 시각
) ENGINE=InnoDB;

/* -----------------------------
   2) category: 카테고리 마스터
   ----------------------------- */
CREATE TABLE IF NOT EXISTS category (
                                        id   BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        name VARCHAR(60) NOT NULL,
                                        CONSTRAINT uq_category_name UNIQUE (name)
) ENGINE=InnoDB;

/* -----------------------------
   3) ai_tool: 실제 노출되는 AI 서비스
   ----------------------------- */
CREATE TABLE IF NOT EXISTS ai_tool (
                                       id            BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       name          VARCHAR(120) NOT NULL,
                                       sub_title     VARCHAR(200) NULL,
                                       origin        VARCHAR(30)  NULL,
                                       url           VARCHAR(300) NULL,  -- NULL 허용 (UNIQUE는 NULL 여러 개 허용)
                                       logo          VARCHAR(300) NULL,
                                       description   TEXT         NULL,
                                       created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                       updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                       CONSTRAINT uq_ai_tool_name UNIQUE (name),
                                       CONSTRAINT uq_ai_tool_url  UNIQUE (url)
) ENGINE=InnoDB;

/* -----------------------------
   4) ai_tool_category: 툴-카테고리 N:N
   ----------------------------- */
CREATE TABLE IF NOT EXISTS ai_tool_category (
                                                tool_id     BIGINT NOT NULL,
                                                category_id BIGINT NOT NULL,
                                                PRIMARY KEY (tool_id, category_id),
                                                CONSTRAINT fk_atc_tool
                                                    FOREIGN KEY (tool_id)     REFERENCES ai_tool(id)     ON DELETE CASCADE,
                                                CONSTRAINT fk_atc_category
                                                    FOREIGN KEY (category_id) REFERENCES category(id)    ON DELETE CASCADE
) ENGINE=InnoDB;

/* -----------------------------
   5) ai_tool_application:
      개발자 신청용 테이블 (신청자 + 승인자 상태관리)
   ----------------------------- */
CREATE TABLE IF NOT EXISTS ai_tool_application (
                                                   id            BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- 신청자 (로그인 유저)
                                                   user_id       BIGINT NOT NULL,

    -- 신청 폼에서 받는 정보
                                                   name          VARCHAR(120) NOT NULL,
                                                   sub_title     VARCHAR(200) NULL,
                                                   origin        VARCHAR(30)  NULL,
                                                   url           VARCHAR(300) NULL,
                                                   logo          VARCHAR(300) NULL,
                                                   description   TEXT         NULL,

    -- 메타데이터
                                                   applied_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,        -- 신청일자
                                                   status        ENUM('PENDING','APPROVED','REJECTED')
                                                       NOT NULL DEFAULT 'PENDING',                          -- 대기/승인/거절
                                                   reject_reason TEXT NULL,                                           -- 거절 사유
                                                   processed_at  TIMESTAMP NULL,                                      -- 승인/거절 처리 시각
                                                   processed_by  BIGINT NULL,                                         -- 처리한 관리자(users.id)

                                                   CONSTRAINT fk_ata_user
                                                       FOREIGN KEY (user_id)
                                                           REFERENCES users(id) ON DELETE CASCADE,

                                                   CONSTRAINT fk_ata_processed
                                                       FOREIGN KEY (processed_by)
                                                           REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* -----------------------------
   6) ai_tool_application_category:
      신청 시 선택한 카테고리 N:N
   ----------------------------- */
CREATE TABLE IF NOT EXISTS ai_tool_application_category (
                                                            application_id BIGINT NOT NULL,
                                                            category_id    BIGINT NOT NULL,
                                                            PRIMARY KEY (application_id, category_id),
                                                            CONSTRAINT fk_atac_app
                                                                FOREIGN KEY (application_id)
                                                                    REFERENCES ai_tool_application(id) ON DELETE CASCADE,
                                                            CONSTRAINT fk_atac_category
                                                                FOREIGN KEY (category_id)
                                                                    REFERENCES category(id)            ON DELETE CASCADE
) ENGINE=InnoDB;

/* -----------------------------
   7) ai_tool_like: 좋아요 N:N
   ----------------------------- */
CREATE TABLE IF NOT EXISTS ai_tool_like (
                                            user_id BIGINT NOT NULL,
                                            tool_id BIGINT NOT NULL,
                                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                            PRIMARY KEY (user_id, tool_id),

                                            CONSTRAINT fk_like_user
                                                FOREIGN KEY (user_id)
                                                    REFERENCES users(id)
                                                    ON DELETE CASCADE,

                                            CONSTRAINT fk_like_tool
                                                FOREIGN KEY (tool_id)
                                                    REFERENCES ai_tool(id)
                                                    ON DELETE CASCADE
) ENGINE=InnoDB;
