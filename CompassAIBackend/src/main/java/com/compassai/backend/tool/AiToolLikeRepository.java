package com.compassai.backend.tool;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiToolLikeRepository extends JpaRepository<AiToolLike, AiToolLikeId> {

    boolean existsByUserIdAndToolId(Long userId, Long toolId);

    long countByToolId(Long toolId);

    void deleteByUserIdAndToolId(Long userId, Long toolId);

    List<AiToolLike> findByUserId(Long userId);
}
