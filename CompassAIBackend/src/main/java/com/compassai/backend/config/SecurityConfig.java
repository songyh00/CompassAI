package com.compassai.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 비밀번호 암호화용 빈
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // HTTP 보안 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS 설정을 활성화한다
                .cors(Customizer.withDefaults())
                // CSRF를 비활성화한다. API 서버에서는 토큰이나 세션으로만 검증하는 경우가 많다
                .csrf(csrf -> csrf.disable())
                // 요청별 접근 권한을 설정한다
                .authorizeHttpRequests(auth -> auth
                        // 스웨거 문서는 항상 허용한다
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // 인증 관련 API는 모두 허용한다
                        .requestMatchers("/api/auth/**").permitAll()
                        // 나머지 API도 현재는 모두 열어 둔다
                        .requestMatchers("/api/**").permitAll()
                        // 그 외 요청도 전부 허용한다
                        .anyRequest().permitAll()
                )
                // 폼 로그인은 사용하지 않는다
                .formLogin(form -> form.disable())
                // HTTP Basic 인증도 사용하지 않는다
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
