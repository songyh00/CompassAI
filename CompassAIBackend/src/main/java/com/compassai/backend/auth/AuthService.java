package com.compassai.backend.auth;

import com.compassai.backend.auth.dto.UserSignupRequest;
import com.compassai.backend.auth.dto.UserSignupResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;

    public UserSignupResponse signup(UserSignupRequest r) {
        if (r.getName() == null || r.getName().isBlank()) throw new IllegalArgumentException("이름을 입력하세요.");
        if (r.getEmail() == null || r.getEmail().isBlank()) throw new IllegalArgumentException("이메일을 입력하세요.");
        if (r.getPassword() == null || r.getPassword().length() < 4) throw new IllegalArgumentException("비밀번호는 4자 이상.");

        if (userRepository.existsByEmail(r.getEmail()))
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");

        User u = User.builder()
                .name(r.getName())
                .email(r.getEmail())
                .password(r.getPassword())   // 로컬용: 평문 저장
                .build();

        u = userRepository.save(u);
        return new UserSignupResponse(u.getId(), u.getEmail(), u.getName());
    }
}
