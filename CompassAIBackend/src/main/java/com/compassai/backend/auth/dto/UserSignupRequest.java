package com.compassai.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "회원가입 요청 DTO")
public class UserSignupRequest {

    @Schema(description = "이름", example = "홍길동")
    private String name;

    @Schema(description = "이메일 주소", example = "test@test.com")
    private String email;

    @Schema(description = "비밀번호", example = "test1234")
    private String password;
}
