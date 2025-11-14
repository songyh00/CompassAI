package com.compassai.backend.tool.controller;

import com.compassai.backend.tool.domain.Category;
import com.compassai.backend.tool.dto.AiToolResponse;
import com.compassai.backend.tool.domain.AiTool;
import com.compassai.backend.tool.repository.AiToolRepository;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tools")
public class AiToolController {

    private final AiToolRepository repo;

    public AiToolController(AiToolRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public Page<AiToolResponse> list(
            @RequestParam(required=false) String category,
            @RequestParam(required=false) String q,
            @RequestParam(required=false) String origin,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size
    ) {
        Page<AiTool> p = repo.findAllFiltered(
                (category != null && !category.isBlank()) ? category : null,
                (q != null && !q.isBlank()) ? q : null,
                (origin != null && !origin.isBlank()) ? origin : null,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"))
        );
        return p.map(this::toDto);
    }

    @GetMapping("/{id}")
    public AiToolResponse get(@PathVariable Long id) {
        AiTool t = repo.findById(id).orElseThrow();
        return toDto(t);
    }

    private AiToolResponse toDto(AiTool t) {
        return new AiToolResponse(
                t.getId(),
                t.getName(),
                t.getSubTitle(),
                t.getOrigin(),
                t.getUrl(),
                t.getLogo(),
                t.getDescription(),
                t.getCategories().stream().map(Category::getName).sorted().toList()
        );
    }
}
