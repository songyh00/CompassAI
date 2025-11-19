package com.compassai.backend.tool;

import com.compassai.backend.tool.dto.LikeStatusResponse;
import com.compassai.backend.tool.repository.AiToolRepository;
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

    private void validateToolExists(Long toolId) {
        if (!aiToolRepository.existsById(toolId)) {
            throw new IllegalArgumentException("존재하지 않는 툴입니다.");
        }
    }
}
