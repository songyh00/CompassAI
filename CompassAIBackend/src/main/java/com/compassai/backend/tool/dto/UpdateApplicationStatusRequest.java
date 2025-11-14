// src/main/java/com/compassai/backend/tool/dto/UpdateApplicationStatusRequest.java
package com.compassai.backend.tool.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApplicationStatusRequest {

    private String status;       // "PENDING" | "APPROVED" | "REJECTED"
    private String rejectReason; // 거절 시 사유 (선택)
}
