package com.compassai.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSignupResponse {

    // 생성된 유저의 ID
    private Long id;

    // 유저 이름
    private String name;

    // 유저 이메일
    private String email;

    // ✅ 유저 권한 (USER / ADMIN)
    private String role;
}
