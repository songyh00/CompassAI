// src/main/java/com/compassai/backend/tool/repository/AiToolRepository.java
package com.compassai.backend.tool.repository;

import com.compassai.backend.tool.domain.AiTool;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AiToolRepository extends JpaRepository<AiTool, Long> {

    // ✅ 승인 시 upsert용: 이름으로 조회
    Optional<AiTool> findByName(String name);

    // ✅ 승인 시 upsert용: URL로 조회
    Optional<AiTool> findByUrl(String url);

    // ✅ 이미 있던 검색용 필터 쿼리
    @Query("""
      SELECT DISTINCT t FROM AiTool t
      LEFT JOIN t.categories c
      WHERE (:category IS NULL OR c.name = :category)
        AND (:origin   IS NULL OR t.origin = :origin)
        AND (
              :q IS NULL OR :q = '' OR
              t.name        LIKE CONCAT('%', :q, '%') OR
              t.subTitle    LIKE CONCAT('%', :q, '%') OR
              t.description LIKE CONCAT('%', :q, '%')
            )
      """)
    Page<AiTool> findAllFiltered(@Param("category") String category,
                                 @Param("q")        String q,
                                 @Param("origin")   String origin,
                                 Pageable pageable);
}
