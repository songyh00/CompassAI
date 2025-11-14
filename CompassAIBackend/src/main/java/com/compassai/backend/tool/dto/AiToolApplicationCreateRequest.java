package com.compassai.backend.tool.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * AI 서비스 신청 폼 요청 DTO
 * 프론트에서 오는 JSON:
 * {
 *   "name": "",
 *   "subTitle": "",
 *   "categories": [],
 *   "origin": "",
 *   "url": "",
 *   "logo": "",
 *   "long": ""
 * }
 */
@Getter
@Setter
public class AiToolApplicationCreateRequest {

    private String name;
    private String subTitle;
    private List<String> categories;
    private String origin;
    private String url;
    private String logo;

    // JSON 필드 long -> description 으로 매핑
    @JsonProperty("long")
    private String description;
}
