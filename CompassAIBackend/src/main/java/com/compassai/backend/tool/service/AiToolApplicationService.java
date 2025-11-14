package com.compassai.backend.tool.service;

import com.compassai.backend.auth.User;
import com.compassai.backend.auth.UserRepository;
import com.compassai.backend.tool.domain.AiToolApplication;
import com.compassai.backend.tool.domain.AiToolApplicationCategory;
import com.compassai.backend.tool.domain.ApplicationStatus;
import com.compassai.backend.tool.domain.Category;
import com.compassai.backend.tool.dto.AiToolApplicationCreateRequest;
import com.compassai.backend.tool.dto.ToolApplicationResponse;
import com.compassai.backend.tool.repository.AiToolApplicationCategoryRepository;
import com.compassai.backend.tool.repository.AiToolApplicationRepository;
import com.compassai.backend.tool.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiToolApplicationService {

    private final AiToolApplicationRepository applicationRepository;
    private final AiToolApplicationCategoryRepository appCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_TIME_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * AI 서비스 신청 생성 (사용자 제출)
     */
    @Transactional
    public Long createApplication(Long userId, AiToolApplicationCreateRequest dto) {

        // 1) 신청자 조회
        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다. id=" + userId));

        // 2) 신청 엔티티 저장 (status = PENDING)
        AiToolApplication application = AiToolApplication.builder()
                .applicant(applicant)
                .name(dto.getName())
                .subTitle(dto.getSubTitle())
                .origin(dto.getOrigin())
                .url(dto.getUrl())
                .logo(dto.getLogo())
                .description(dto.getDescription()) // JSON "long" → description
                .status(ApplicationStatus.PENDING)
                .build();

        applicationRepository.save(application);

        // 3) 카테고리 매핑
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
     * 🔍 관리자용: 전체 신청 목록 조회
     * - 신청자/카테고리까지 한 번에 DTO로 변환
     */
    @Transactional(readOnly = true)
    public List<ToolApplicationResponse> getAllApplicationsForAdmin() {
        List<AiToolApplication> apps = applicationRepository.findAllWithApplicantAndCategories();

        return apps.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * ✅ 관리자용: 상태 변경 (승인/거절)
     *
     * @param appId         신청 ID
     * @param nextStatus    다음 상태 (APPROVED / REJECTED)
     * @param rejectReason  거절 사유 (거절일 때만 사용)
     * @param adminUserId   처리한 관리자 ID
     */
    @Transactional
    public void updateStatus(Long appId,
                             ApplicationStatus nextStatus,
                             String rejectReason,
                             Long adminUserId) {

        AiToolApplication app = applicationRepository.findById(appId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신청입니다. id=" + appId));

        // 관리자 정보
        User admin = null;
        if (adminUserId != null) {
            admin = userRepository.findById(adminUserId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 관리자입니다. id=" + adminUserId));
        }

        // 상태 변경
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
        // JPA dirty checking으로 자동 업데이트됨
    }

    // ===== 내부 DTO 매핑 유틸 =====

    private ToolApplicationResponse toResponse(AiToolApplication app) {

        // 카테고리 이름 목록
        List<String> categoryNames = app.getCategories().stream()
                .map(link -> link.getCategory().getName())
                .distinct()
                .toList();

        return new ToolApplicationResponse(
                app.getId(),
                app.getName(),
                app.getSubTitle(),
                app.getOrigin(),
                app.getUrl(),
                app.getLogo(),
                app.getDescription(),
                app.getStatus().name(),          // String 그대로
                app.getAppliedAt(),              // LocalDateTime 그대로
                app.getProcessedAt(),            // LocalDateTime 그대로
                app.getRejectReason(),           // String 또는 null
                new ToolApplicationResponse.ApplicantDto(
                        app.getApplicant().getId(),
                        app.getApplicant().getName(),
                        app.getApplicant().getEmail()
                ),
                categoryNames
        );
    }

}
