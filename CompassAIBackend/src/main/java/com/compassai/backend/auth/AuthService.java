package com.compassai.backend.auth;

import com.compassai.backend.auth.dto.UserLoginRequest;
import com.compassai.backend.auth.dto.UserLoginResponse;
import com.compassai.backend.auth.dto.UserSignupRequest;
import com.compassai.backend.auth.dto.UserSignupResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입 처리
    @Transactional
    public UserSignupResponse signup(UserSignupRequest request) {
        // 이메일은 소문자+trim으로 정규화해서 저장한다
        String email = normalizeEmail(request.getEmail());

        // 이메일 중복 여부를 먼저 확인한다
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // 회원가입은 항상 일반 유저 권한으로 생성한다

        try {
            User saved = userRepository.save(user);
            return new UserSignupResponse(saved.getId(), saved.getName(), saved.getEmail());
        } catch (DataIntegrityViolationException e) {
            // 동시에 가입 요청이 들어오는 등의 상황에서 중복 키 에러가 날 수 있으므로 한 번 더 방어한다
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
    }

    // 로그인 처리
    @Transactional(readOnly = true)
    public UserLoginResponse login(UserLoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return new UserLoginResponse(user.getId(), user.getName(), user.getEmail());
    }

    // 이메일을 한 번 정규화해서 쓰기 위한 유틸 메서드
    private String normalizeEmail(String raw) {
        if (raw == null) {
            return null;
        }
        return raw.trim().toLowerCase(Locale.ROOT);
    }
}
