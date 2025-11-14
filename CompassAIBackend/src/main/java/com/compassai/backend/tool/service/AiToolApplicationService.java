// src/main/java/com/compassai/backend/tool/service/AiToolApplicationService.java
package com.compassai.backend.tool.service;

import com.compassai.backend.auth.User;
import com.compassai.backend.auth.UserRepository;
import com.compassai.backend.tool.domain.AiTool;
import com.compassai.backend.tool.domain.AiToolApplication;
import com.compassai.backend.tool.domain.AiToolApplicationCategory;
import com.compassai.backend.tool.domain.ApplicationStatus;
import com.compassai.backend.tool.domain.Category;
import com.compassai.backend.tool.dto.AiToolApplicationCreateRequest;
import com.compassai.backend.tool.dto.ToolApplicationResponse;
import com.compassai.backend.tool.repository.AiToolApplicationCategoryRepository;
import com.compassai.backend.tool.repository.AiToolApplicationRepository;
import com.compassai.backend.tool.repository.AiToolRepository;
import com.compassai.backend.tool.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiToolApplicationService {

    private final AiToolApplicationRepository applicationRepository;
    private final AiToolApplicationCategoryRepository appCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    // 실제 노출용 테이블 레포지토리
    private final AiToolRepository aiToolRepository;

    /**
     * AI 서비스 신청 생성
     *
     * @param userId 로그인한 유저 ID
     * @param dto    폼 데이터
     * @return 생성된 신청 ID
     */
    @Transactional
    public Long createApplication(Long userId, AiToolApplicationCreateRequest dto) {

        // 1) 신청자 조회
        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다. id=" + userId));

        // 2) 신청 엔티티 저장 (status=PENDING)
        AiToolApplication application = AiToolApplication.builder()
                .applicant(applicant)
                .name(dto.getName())
                .subTitle(dto.getSubTitle())
                .origin(dto.getOrigin())
                .url(dto.getUrl())
                .logo(dto.getLogo())
                .description(dto.getDescription())
                .status(ApplicationStatus.PENDING)
                .build();

        applicationRepository.save(application);

        // 3) 카테고리 매핑 (신청용 조인 테이블)
        if (dto.getCategories() != null) {
            dto.getCategories().stream()
                    .filter(name -> name != null && !name.isBlank())
                    .forEach(catName -> {
                        // (1) 이름으로 Category 찾기, 없으면 생성
                        Category category = categoryRepository.findByName(catName)
                                .orElseGet(() ->
                                        categoryRepository.save(
                                                Category.builder().name(catName).build()
                                        ));

                        // (2) 조인 테이블 저장
                        AiToolApplicationCategory link = AiToolApplicationCategory.builder()
                                .application(application)
                                .category(category)
                                .build();

                        appCategoryRepository.save(link);
                    });
        }

        return application.getId();
    }

    /**
     * 관리자용: 모든 신청 목록 조회
     * - AdminToolReview.tsx에서 바로 쓰기 좋은 형태의 DTO로 변환
     */
    @Transactional(readOnly = true)
    public List<ToolApplicationResponse> getAllApplicationsForAdmin() {
        List<AiToolApplication> apps = applicationRepository.findAll();

        return apps.stream()
                .map(app -> {
                    User applicant = app.getApplicant();

                    List<String> categoryNames = app.getCategories().stream()
                            .map(link -> link.getCategory().getName())
                            .toList();

                    return new ToolApplicationResponse(
                            app.getId(),
                            app.getName(),
                            app.getSubTitle(),
                            app.getOrigin(),
                            app.getUrl(),
                            app.getLogo(),
                            app.getDescription(),
                            app.getStatus().name(),
                            app.getAppliedAt(),
                            app.getProcessedAt(),
                            app.getRejectReason(),
                            new ToolApplicationResponse.ApplicantDto(
                                    applicant.getId(),
                                    applicant.getName(),
                                    applicant.getEmail()
                            ),
                            categoryNames
                    );
                })
                .toList();
    }

    /**
     * 관리자: 신청 상태 변경 + (승인 시) 실제 ai_tool / ai_tool_category에 반영
     */
    @Transactional
    public void updateStatus(Long appId,
                             ApplicationStatus nextStatus,
                             String rejectReason,
                             Long adminUserId) {

        AiToolApplication app = applicationRepository.findById(appId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신청입니다. id=" + appId));

        // 처리한 관리자
        User admin = null;
        if (adminUserId != null) {
            admin = userRepository.findById(adminUserId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 관리자입니다. id=" + adminUserId));
        }

        // 상태/메타데이터 업데이트
        app.setStatus(nextStatus);
        app.setProcessedAt(LocalDateTime.now());
        app.setProcessedBy(admin);

        if (nextStatus == ApplicationStatus.REJECTED) {
            if (rejectReason == null || rejectReason.isBlank()) {
                app.setRejectReason("관리자에 의해 거절되었습니다.");
            } else {
                app.setRejectReason(rejectReason);
            }
        } else {
            // 승인 등 다른 상태일 때는 거절 사유 제거
            app.setRejectReason(null);
        }

        // ✅ 승인일 때 실제 노출 테이블(ai_tool / ai_tool_category)에 반영
        if (nextStatus == ApplicationStatus.APPROVED) {

            // 1) 이름 또는 URL 기준으로 기존 ai_tool 이 있는지 확인
            AiTool tool = null;

            if (app.getName() != null && !app.getName().isBlank()) {
                tool = aiToolRepository.findByName(app.getName()).orElse(null);
            }
            if (tool == null && app.getUrl() != null && !app.getUrl().isBlank()) {
                tool = aiToolRepository.findByUrl(app.getUrl()).orElse(null);
            }

            if (tool == null) {
                // 2-1) 없으면 새로 생성
                tool = AiTool.builder()
                        .name(app.getName())
                        .subTitle(app.getSubTitle())
                        .origin(app.getOrigin())
                        .url(app.getUrl())
                        .logo(app.getLogo())
                        .description(app.getDescription())
                        .build();
            } else {
                // 2-2) 이미 존재하면 최신 신청 내용으로 일부 필드 갱신
                tool.setSubTitle(app.getSubTitle());
                tool.setOrigin(app.getOrigin());
                tool.setUrl(app.getUrl());
                tool.setLogo(app.getLogo());
                tool.setDescription(app.getDescription());
            }

            // 저장 (INSERT 또는 UPDATE)
            AiTool savedTool = aiToolRepository.save(tool);

            // lambda에서 쓸 final 변수로 고정
            final AiTool finalTool = savedTool;

            // 3) 카테고리 매핑: ai_tool_category (ManyToMany 컬렉션)
            if (app.getCategories() != null) {
                app.getCategories().forEach(appCat -> {
                    Category category = appCat.getCategory();

                    // 중복 추가 방지
                    if (!finalTool.getCategories().contains(category)) {
                        finalTool.getCategories().add(category);
                    }
                });
            }
            // finalTool 은 영속 상태이므로, 트랜잭션 커밋 시 자동으로 ai_tool_category에 반영됨
        }
    }
}
