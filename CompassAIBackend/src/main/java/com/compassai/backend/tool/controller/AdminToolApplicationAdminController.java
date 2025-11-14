// src/main/java/com/compassai/backend/tool/controller/AdminToolApplicationAdminController.java
package com.compassai.backend.tool.controller;

import com.compassai.backend.auth.dto.MeResponse;
import com.compassai.backend.tool.domain.ApplicationStatus;
import com.compassai.backend.tool.dto.ToolApplicationResponse;
import com.compassai.backend.tool.dto.UpdateApplicationStatusRequest;
import com.compassai.backend.tool.service.AiToolApplicationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/ai-applications")
@RequiredArgsConstructor
public class AdminToolApplicationAdminController {

    private static final String SESSION_USER_KEY = "user";

    private final AiToolApplicationService applicationService;

    // 1) 목록 조회
    @GetMapping
    public ResponseEntity<?> list(HttpSession session) {
        MeResponse me = (MeResponse) session.getAttribute(SESSION_USER_KEY);
        if (me == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        if (!"ADMIN".equals(me.getRole())) {
            return ResponseEntity.status(403).body("관리자만 접근할 수 있습니다.");
        }

        List<ToolApplicationResponse> list = applicationService.getAllApplicationsForAdmin();
        return ResponseEntity.ok(list);
    }

    // 2) 상태 변경 (승인/거절)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateApplicationStatusRequest req,
            HttpSession session
    ) {
        MeResponse me = (MeResponse) session.getAttribute(SESSION_USER_KEY);
        if (me == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        if (!"ADMIN".equals(me.getRole())) {
            return ResponseEntity.status(403).body("관리자만 접근할 수 있습니다.");
        }

        ApplicationStatus next;
        try {
            next = ApplicationStatus.valueOf(req.getStatus());
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body("잘못된 상태 값입니다: " + req.getStatus());
        }

        applicationService.updateStatus(id, next, req.getRejectReason(), me.getId());

        return ResponseEntity.ok().build();
    }
}
