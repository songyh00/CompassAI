package com.compassai.backend.auth;

import com.compassai.backend.auth.dto.UserLoginRequest;
import com.compassai.backend.auth.dto.UserLoginResponse;
import com.compassai.backend.auth.dto.UserSignupRequest;
import com.compassai.backend.auth.dto.UserSignupResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "회원 인증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String SESSION_USER_KEY = "user";
    private static final String REFRESH_COOKIE = "REFRESH_TOKEN";

    private final AuthService authService;

    // 회원가입
    @Operation(
            summary = "회원가입",
            description = "이름, 이메일, 비밀번호로 신규 회원을 등록합니다.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(examples = {
                            @ExampleObject(name = "회원가입 예시", value = """
                                    {
                                      "name": "test",
                                      "email": "test@test.com",
                                      "password": "test1234"
                                    }
                                    """)
                    })
            )
    )
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@org.springframework.web.bind.annotation.RequestBody UserSignupRequest req,
                                    HttpSession session) {
        try {
            UserSignupResponse res = authService.signup(req);
            session.setAttribute(SESSION_USER_KEY, res);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 로그인
    @Operation(
            summary = "로그인",
            description = "이메일과 비밀번호로 로그인합니다.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(examples = {
                            @ExampleObject(name = "로그인 예시", value = """
                                    {
                                      "email": "test@test.com",
                                      "password": "test1234"
                                    }
                                    """)
                    })
            )
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(@org.springframework.web.bind.annotation.RequestBody UserLoginRequest req,
                                   HttpServletRequest httpReq,
                                   HttpSession session) {
        try {
            UserLoginResponse res = authService.login(req);

            // 세션 고정 방지: 로그인 직후 세션ID 재발급
            httpReq.changeSessionId();

            // 필요한 최소 정보만 세션 저장 (여기서는 응답 그대로)
            session.setAttribute(SESSION_USER_KEY, res);

            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // 현재 사용자 (로그인 여부 확인)
    @Operation(summary = "현재 사용자", description = "로그인되어 있으면 사용자 정보를, 아니면 null을 반환합니다.")
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Object user = session.getAttribute(SESSION_USER_KEY);
        return ResponseEntity.ok(user); // 로그인 안 되어 있으면 null
    }

    // 로그아웃: 세션 종료 + REFRESH_TOKEN 쿠키 만료
    @Operation(summary = "로그아웃", description = "세션을 종료하고 리프레시 쿠키를 삭제합니다.")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session, HttpServletResponse response) {
        session.invalidate();
        expireCookie(response, REFRESH_COOKIE);
        // 필요 시 JSESSIONID도 강제 만료하려면 다음 주석 해제
        // expireCookie(response, "JSESSIONID");
        return ResponseEntity.ok().build();
    }

    // ---- 내부 유틸: 이름이 같은 쿠키를 즉시 만료 처리 ----
    private void expireCookie(HttpServletResponse response, String name) {
        Cookie c = new Cookie(name, "");
        c.setPath("/");          // 굽던 때와 동일한 path
        c.setMaxAge(0);          // 즉시 만료
        c.setHttpOnly(true);     // HttpOnly 유지
        // 로컬 개발(HTTP)이라면 false, HTTPS 배포라면 true
        c.setSecure(false);
        // 필요 시 SameSite 속성 (서블릿 6에서는 attribute로 지정 가능)
        c.setAttribute("SameSite", "Lax");
        response.addCookie(c);
    }
}
