// src/main/java/com/compassai/backend/auth/AdminInitializer.java
package com.compassai.backend.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        String email = "admin@admin.com";

        // 이미 있으면 아무 것도 안 함
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User admin = new User();
        admin.setName("관리자");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode("admin1234"));
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);
    }
}
