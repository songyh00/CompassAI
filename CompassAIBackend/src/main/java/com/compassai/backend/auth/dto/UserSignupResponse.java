package com.compassai.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSignupResponse {
    private Long id;
    private String email;
    private String name;
}
