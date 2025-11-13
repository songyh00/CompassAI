package com.compassai.backend.tool.controller;

import com.compassai.backend.tool.service.AiToolApplicationService;
import com.compassai.backend.tool.dto.AiToolApplicationCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tools/applications")
@RequiredArgsConstructor
public class AiToolApplicationController {

    private final AiToolApplicationService applicationService;

    /**
     * 개발자가 AI 서비스 신청을 넣는 API
     */
    @PostMapping
    public ResponseEntity<CreateApplicationResponse> createApplication(
            @RequestBody AiToolApplicationCreateRequest request
    ) {
        // TODO: 나중에 Security 붙이면 로그인 유저에서 꺼내기
        // ex) Long userId = currentUser.getId();
        Long userId = 1L; // 임시 하드코딩

        Long appId = applicationService.createApplication(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new CreateApplicationResponse(appId));
    }

    // 간단 응답 DTO
    public record CreateApplicationResponse(Long applicationId) {}
}
