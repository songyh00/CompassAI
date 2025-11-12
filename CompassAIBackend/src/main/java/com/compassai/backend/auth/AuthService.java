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
    private final PasswordEncoder passwordEncoder; // BCrypt를 @Bean으로 등록해 주입받기

    /** 회원가입 (쓰기 트랜잭션) */
    @Transactional
    public UserSignupResponse signup(UserSignupRequest req) {
        final String email = normalizeEmail(req.getEmail());

        // 선제 중복 체크(UX용). 실제 보장은 DB 유니크 제약으로.
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        try {
            User user = new User();
            user.setName(req.getName());
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(req.getPassword()));

            userRepository.save(user);
            return new UserSignupResponse(user.getId(), user.getName(), user.getEmail());
        } catch (DataIntegrityViolationException e) {
            // 동시성으로 인해 유니크 충돌 시 안전한 메시지로 매핑
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
    }

    /** 로그인 (읽기 전용 트랜잭션) */
    @Transactional(readOnly = true)
    public UserLoginResponse login(UserLoginRequest req) {
        final String email = normalizeEmail(req.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 잘못되었습니다."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        return new UserLoginResponse(user.getId(), user.getName(), user.getEmail());
    }

    // --- 내부 유틸 ---
    private String normalizeEmail(String raw) {
        if (raw == null) return null;
        return raw.trim().toLowerCase(Locale.ROOT);
    }
}
