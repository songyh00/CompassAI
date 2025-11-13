package com.compassai.backend.tool.service;

import com.compassai.backend.auth.User;
import com.compassai.backend.auth.UserRepository;
import com.compassai.backend.tool.domain.Category;
import com.compassai.backend.tool.domain.AiToolApplication;
import com.compassai.backend.tool.domain.AiToolApplicationCategory;
import com.compassai.backend.tool.domain.ApplicationStatus;
import com.compassai.backend.tool.dto.AiToolApplicationCreateRequest;
import com.compassai.backend.tool.repository.AiToolApplicationCategoryRepository;
import com.compassai.backend.tool.repository.AiToolApplicationRepository;
import com.compassai.backend.tool.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiToolApplicationService {

    private final AiToolApplicationRepository applicationRepository;
    private final AiToolApplicationCategoryRepository appCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

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
}
