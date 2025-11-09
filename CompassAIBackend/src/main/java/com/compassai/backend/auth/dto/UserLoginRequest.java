package com.compassai.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "로그인 요청 DTO")
public class UserLoginRequest {

    @Schema(description = "이메일 주소", example = "test@test.com")
    private String email;

    @Schema(description = "비밀번호", example = "test1234")
    private String password;
}
