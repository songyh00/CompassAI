package com.compassai.backend.auth;

import com.compassai.backend.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "회원 인증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // -------------------------
    // 회원가입
    // -------------------------
    @Operation(
            summary = "회원가입",
            description = "이름, 이메일, 비밀번호로 신규 회원을 등록합니다.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(
                            examples = {
                                    @ExampleObject(
                                            name = "회원가입 예시",
                                            value = """
                        {
                          "name": "test",
                          "email": "test@test.com",
                          "password": "test1234"
                        }
                        """
                                    )
                            }
                    )
            )
    )
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@org.springframework.web.bind.annotation.RequestBody UserSignupRequest req, HttpSession session) {
        try {
            UserSignupResponse res = authService.signup(req);
            session.setAttribute("user", res);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------
    // 로그인
    // -------------------------
    @Operation(
            summary = "로그인",
            description = "이메일과 비밀번호로 로그인합니다. 성공 시 세션에 사용자 정보가 저장됩니다.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(
                            examples = {
                                    @ExampleObject(
                                            name = "로그인 예시",
                                            value = """
                        {
                          "email": "test@test.com",
                          "password": "test1234"
                        }
                        """
                                    )
                            }
                    )
            )
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(@org.springframework.web.bind.annotation.RequestBody UserLoginRequest req, HttpSession session) {
        try {
            UserLoginResponse res = authService.login(req);
            session.setAttribute("user", res);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
    // 현재 세션의 사용자 조회 (로그인 여부 확인용)
    @Operation(summary = "현재 사용자", description = "로그인되어 있으면 사용자 정보를, 아니면 null을 반환합니다.")
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Object user = session.getAttribute("user"); // 로그인/회원가입 시 넣어둔 객체
        return ResponseEntity.ok(user);             // 로그인 안 되어 있으면 null
    }

    // 로그아웃 (세션 종료)
    @Operation(summary = "로그아웃", description = "세션을 종료합니다.")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }
}
