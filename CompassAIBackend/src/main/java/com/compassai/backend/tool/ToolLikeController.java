package com.compassai.backend.tool;

import com.compassai.backend.auth.dto.MeResponse;
import com.compassai.backend.tool.dto.AiToolResponse;
import com.compassai.backend.tool.dto.LikeStatusResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
public class ToolLikeController {

    private static final String SESSION_USER_KEY = "user";

    private final ToolLikeService toolLikeService;

    private Long getLoginUserIdOrNull(HttpSession session) {
        MeResponse me = (MeResponse) session.getAttribute(SESSION_USER_KEY);
        return (me != null) ? me.getId() : null;
    }

    // 좋아요 상태 조회: GET /api/tools/{toolId}/like/status
    @GetMapping("/{toolId}/like/status")
    public ResponseEntity<LikeStatusResponse> status(
            @PathVariable Long toolId,
            HttpSession session
    ) {
        Long userId = getLoginUserIdOrNull(session);
        LikeStatusResponse res = toolLikeService.getStatus(userId, toolId);
        return ResponseEntity.ok(res);
    }

    // 좋아요: POST /api/tools/{toolId}/like
    @PostMapping("/{toolId}/like")
    public ResponseEntity<?> like(
            @PathVariable Long toolId,
            HttpSession session
    ) {
        Long userId = getLoginUserIdOrNull(session);
        if (userId == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        LikeStatusResponse res = toolLikeService.like(userId, toolId);
        return ResponseEntity.ok(res);
    }

    // 좋아요 취소: DELETE /api/tools/{toolId}/like
    @DeleteMapping("/{toolId}/like")
    public ResponseEntity<?> unlike(
            @PathVariable Long toolId,
            HttpSession session
    ) {
        Long userId = getLoginUserIdOrNull(session);
        if (userId == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        LikeStatusResponse res = toolLikeService.unlike(userId, toolId);
        return ResponseEntity.ok(res);
    }

    // 내가 좋아요한 AI 툴 목록: GET /api/tools/likes/my
    @GetMapping("/likes/my")
    public ResponseEntity<?> myLikes(HttpSession session) {
        Long userId = getLoginUserIdOrNull(session);
        if (userId == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        List<AiToolResponse> liked = toolLikeService.getLikedTools(userId);
        return ResponseEntity.ok(liked);
    }
}
