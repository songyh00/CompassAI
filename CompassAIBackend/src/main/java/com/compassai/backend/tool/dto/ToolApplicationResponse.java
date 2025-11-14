// src/main/java/com/compassai/backend/tool/dto/ToolApplicationResponse.java
package com.compassai.backend.tool.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class ToolApplicationResponse {

    private Long id;

    private String name;
    private String subTitle;
    private String origin;
    private String url;
    private String logo;
    private String description;

    private String status;          // "PENDING" | "APPROVED" | "REJECTED"
    private LocalDateTime appliedAt;
    private LocalDateTime processedAt;
    private String rejectReason;

    private ApplicantDto applicant; // 신청자
    private List<String> categories;

    @Getter
    @AllArgsConstructor
    public static class ApplicantDto {
        private Long id;
        private String name;
        private String email;
    }
}
