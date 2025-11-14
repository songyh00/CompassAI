package com.compassai.backend.tool.domain;

import lombok.*;

import java.io.Serializable;

/**
 * ai_tool_application_category 복합키
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class AiToolApplicationCategoryId implements Serializable {

    private Long application; // 필드명 = 엔티티의 필드명
    private Long category;
}
