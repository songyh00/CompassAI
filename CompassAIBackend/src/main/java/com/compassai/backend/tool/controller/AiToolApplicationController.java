package com.compassai.backend.tool.controller;

import com.compassai.backend.auth.dto.MeResponse;
import com.compassai.backend.tool.dto.AiToolApplicationCreateRequest;
import com.compassai.backend.tool.service.AiToolApplicationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.compassai.backend.auth.dto.MeResponse;

@RestController
@RequestMapping("/api/tools/applications")
@RequiredArgsConstructor
public class AiToolApplicationController {

    private static final String SESSION_USER_KEY = "user";

    private final AiToolApplicationService applicationService;

    /**
     * 개발자가 AI 서비스 신청을 넣는 API
     */
    @PostMapping
    public ResponseEntity<CreateApplicationResponse> createApplication(
            @RequestBody AiToolApplicationCreateRequest request,
            HttpSession session
    ) {
        // 1) 세션에서 로그인 유저 꺼내기
        MeResponse me = (MeResponse) session.getAttribute(SESSION_USER_KEY);
        if (me == null) {
            // 로그인 안돼 있으면 401
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = me.getId();  // ← 여기!

        Long appId = applicationService.createApplication(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new CreateApplicationResponse(appId));
    }
    @GetMapping("/my-applications")
    public ResponseEntity<?> myApplications(HttpSession session) {
        MeResponse me = (MeResponse) session.getAttribute(SESSION_USER_KEY);
        if (me == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        return ResponseEntity.ok(applicationService.getMyApplications(me.getId()));
    }

    // 간단 응답 DTO
    public record CreateApplicationResponse(Long applicationId) {}
}
