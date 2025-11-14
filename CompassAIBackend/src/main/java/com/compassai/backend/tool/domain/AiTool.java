package com.compassai.backend.tool.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ai_tool",
        uniqueConstraints = {
                @UniqueConstraint(name="uq_ai_tool_name", columnNames="name"),
                @UniqueConstraint(name="uq_ai_tool_url",  columnNames="url")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiTool {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length=120, nullable=false)
    private String name;

    @Column(name="sub_title", length=200)
    private String subTitle;

    @Column(length=30)
    private String origin;

    @Column(length=300)   // 과제용: NULL 허용
    private String url;

    @Column(length=300)   // 예: "/gemini.png" (Frontend/public 기준)
    private String logo;

    @Lob
    private String description;

    @Column(name="created_at", nullable=false, updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", nullable=false)
    private LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(
            name = "ai_tool_category",
            joinColumns = @JoinColumn(name = "tool_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
