package com.compassai.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserSignupRequest {
    @Schema(example = "test")
    private String name;

    @Schema(example = "test@test.com")
    private String email;

    @Schema(example = "test1234")
    private String password;
}
