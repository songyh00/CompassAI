package com.compassai.backend.tool;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiToolLikeId implements Serializable {

    private Long userId;
    private Long toolId;
}
