package com.compassai.backend.tool;

import com.compassai.backend.tool.domain.AiTool;
import com.compassai.backend.tool.domain.Category;
import com.compassai.backend.tool.dto.AiToolResponse;
import com.compassai.backend.tool.dto.LikeStatusResponse;
import com.compassai.backend.tool.repository.AiToolLikeRepository;
import com.compassai.backend.tool.repository.AiToolRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ToolLikeService {

    private final AiToolLikeRepository likeRepository;
    private final AiToolRepository aiToolRepository;

    @Transactional
    public LikeStatusResponse like(Long userId, Long toolId) {
        validateToolExists(toolId);

        // 이미 좋아요 상태면 다시 INSERT 안 함 (멱등)
        if (!likeRepository.existsByUserIdAndToolId(userId, toolId)) {
            AiToolLike like = new AiToolLike();
            like.setUserId(userId);
            like.setToolId(toolId);
            likeRepository.save(like);
        }

        long count = likeRepository.countByToolId(toolId);
        return new LikeStatusResponse(toolId, true, count);
    }

    @Transactional
    public LikeStatusResponse unlike(Long userId, Long toolId) {
        validateToolExists(toolId);

        if (likeRepository.existsByUserIdAndToolId(userId, toolId)) {
            likeRepository.deleteByUserIdAndToolId(userId, toolId);
        }

        long count = likeRepository.countByToolId(toolId);
        return new LikeStatusResponse(toolId, false, count);
    }

    @Transactional(readOnly = true)
    public LikeStatusResponse getStatus(Long userIdOrNull, Long toolId) {
        validateToolExists(toolId);

        long count = likeRepository.countByToolId(toolId);
        boolean liked = false;
        if (userIdOrNull != null) {
            liked = likeRepository.existsByUserIdAndToolId(userIdOrNull, toolId);
        }

        return new LikeStatusResponse(toolId, liked, count);
    }

    // ✅ 내가 좋아요한 툴 목록 불러오기
    @Transactional(readOnly = true)
    public List<AiToolResponse> getLikedTools(Long userId) {
        // 1) 유저가 좋아요 누른 관계 엔티티들 (최신 순)
        List<AiToolLike> likes = likeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (likes.isEmpty()) {
            return List.of();
        }

        // 2) toolId 리스트
        List<Long> toolIdsInOrder = likes.stream()
                .map(AiToolLike::getToolId)
                .toList();

        // 3) 실제 AiTool 엔티티들 조회
        List<AiTool> tools = aiToolRepository.findAllById(toolIdsInOrder);
        if (tools.isEmpty()) {
            return List.of();
        }

        // 4) id → AiTool 맵
        Map<Long, AiTool> toolMap = tools.stream()
                .collect(Collectors.toMap(AiTool::getId, t -> t));

        // 5) 좋아요 순서를 유지하면서 DTO로 변환
        List<AiToolResponse> result = new ArrayList<>();
        for (Long toolId : toolIdsInOrder) {
            AiTool t = toolMap.get(toolId);
            if (t == null) {
                continue;
            }

            List<String> categories = t.getCategories().stream()
                    .map(Category::getName)
                    .sorted()
                    .toList();

            result.add(new AiToolResponse(
                    t.getId(),
                    t.getName(),
                    t.getSubTitle(),
                    t.getOrigin(),
                    t.getUrl(),
                    t.getLogo(),
                    t.getDescription(),
                    categories
            ));
        }

        return result;
    }

    private void validateToolExists(Long toolId) {
        if (!aiToolRepository.existsById(toolId)) {
            throw new IllegalArgumentException("존재하지 않는 툴입니다.");
        }
    }
}
