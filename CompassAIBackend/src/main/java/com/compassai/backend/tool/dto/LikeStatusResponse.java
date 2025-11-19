package com.compassai.backend.tool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeStatusResponse {

    private Long toolId;
    private boolean liked;
    private long likeCount;
}
