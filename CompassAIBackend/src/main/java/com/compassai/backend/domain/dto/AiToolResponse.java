package com.compassai.backend.domain.dto;

import java.util.List;

public record AiToolResponse(
        Long id,
        String name,
        String subTitle,
        String origin,
        String url,
        String logo,
        String description,
        List<String> categories
) {}
