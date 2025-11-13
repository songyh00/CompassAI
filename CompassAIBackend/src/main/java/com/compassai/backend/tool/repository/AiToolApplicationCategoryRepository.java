package com.compassai.backend.tool.repository;

import com.compassai.backend.tool.domain.AiToolApplicationCategory;
import com.compassai.backend.tool.domain.AiToolApplicationCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiToolApplicationCategoryRepository
        extends JpaRepository<AiToolApplicationCategory, AiToolApplicationCategoryId> {
}
