package com.compassai.backend.tool.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_tool_application_category")
@IdClass(AiToolApplicationCategoryId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiToolApplicationCategory {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private AiToolApplication application;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
