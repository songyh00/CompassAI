package com.compassai.backend.domain;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface AiToolRepository extends JpaRepository<AiTool, Long> {

    @Query("""
      SELECT DISTINCT t FROM AiTool t
      LEFT JOIN t.categories c
      WHERE (:category IS NULL OR c.name = :category)
        AND (:origin   IS NULL OR t.origin = :origin)
        AND (
              :q IS NULL OR :q = '' OR
              t.name      LIKE CONCAT('%', :q, '%') OR
              t.subTitle  LIKE CONCAT('%', :q, '%') OR
              t.description LIKE CONCAT('%', :q, '%')
            )
      """)
    Page<AiTool> findAllFiltered(@Param("category") String category,
                                 @Param("q")        String q,
                                 @Param("origin")   String origin,
                                 Pageable pageable);
}
