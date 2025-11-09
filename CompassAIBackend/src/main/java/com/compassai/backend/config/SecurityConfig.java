package com.compassai.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ✅ CSRF 비활성화
                .csrf(csrf -> csrf.disable())
                // ✅ 요청별 권한 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()   // Swagger + API 전체 허용
                        .anyRequest().permitAll() // 나머지도 허용
                )
                // ✅ 폼 로그인 완전 비활성화 (이걸 안 하면 /login redirect 발생)
                .formLogin(form -> form.disable())
                // ✅ HTTP Basic 비활성화
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
