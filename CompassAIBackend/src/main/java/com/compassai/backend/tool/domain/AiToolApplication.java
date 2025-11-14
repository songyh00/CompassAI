package com.compassai.backend.tool.domain;

import com.compassai.backend.auth.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_tool_application")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiToolApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 신청자 users.id */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User applicant;

    // ===== 신청 폼에서 받는 정보 =====

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "sub_title", length = 200)
    private String subTitle;

    @Column(length = 30)
    private String origin;

    @Column(length = 300)
    private String url;

    @Column(length = 300)
    private String logo;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // ===== 메타데이터 =====

    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private ApplicationStatus status;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    /** 신청 ↔ 카테고리 N:N 조인 테이블 컬렉션 */
    @Builder.Default   // 🔥 Lombok Builder가 이 초기값을 기본값으로 사용하도록
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AiToolApplicationCategory> categories = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        if (appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ApplicationStatus.PENDING;
        }
    }
}
