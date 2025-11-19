package com.compassai.backend.tool;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ai_tool_like")
@IdClass(AiToolLikeId.class)
@Getter
@Setter
public class AiToolLike {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Id
    @Column(name = "tool_id", nullable = false)
    private Long toolId;

    // DB의 DEFAULT CURRENT_TIMESTAMP 사용
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
