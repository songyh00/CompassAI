package com.compassai.backend.tool;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiToolLikeRepository extends JpaRepository<AiToolLike, AiToolLikeId> {

    boolean existsByUserIdAndToolId(Long userId, Long toolId);

    long countByToolId(Long toolId);

    void deleteByUserIdAndToolId(Long userId, Long toolId);

    List<AiToolLike> findByUserId(Long userId);

    // ✅ 내가 좋아요한 툴들을 "좋아요 누른 시간 역순"으로 가져오기
    List<AiToolLike> findByUserIdOrderByCreatedAtDesc(Long userId);
}
