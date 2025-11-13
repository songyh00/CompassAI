// src/main/java/com/compassai/backend/auth/dto/MeResponse.java
package com.compassai.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MeResponse {

    private Long id;
    private String name;
    private String email;
    private String role;   // ✅ USER / ADMIN
}
