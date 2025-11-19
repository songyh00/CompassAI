package com.compassai.backend.auth;

import com.compassai.backend.auth.dto.MeResponse;
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
import com.compassai.backend.auth.dto.ChangePasswordRequest;
import com.compassai.backend.auth.dto.UpdateMeRequest;

/**
 * 인증 관련 API를 담당하는 컨트롤러
 * - 회원가입
 * - 로그인
 * - 현재 사용자 조회
 * - 로그아웃
 */
@Tag(name = "Auth", description = "회원 인증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // 세션에 사용자 정보를 저장할 때 사용하는 키
    private static final String SESSION_USER_KEY = "user";

    // 리프레시 토큰을 저장하는 쿠키 이름
    private static final String REFRESH_COOKIE = "REFRESH_TOKEN";

    private final AuthService authService;

    /**
     * 회원가입
     * - 이름, 이메일, 비밀번호로 신규 회원을 등록한다.
     * - 성공 시 세션에 사용자 정보를 저장하고 응답으로 돌려준다.
     */
    @Operation(
            summary = "회원가입",
            description = "이름, 이메일, 비밀번호로 신규 회원을 등록합니다.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(examples = {
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
                    })
            )
    )
    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @org.springframework.web.bind.annotation.RequestBody UserSignupRequest req,
            HttpSession session
    ) {
        try {
            // 서비스 계층에 회원가입을 요청한다.
            UserSignupResponse res = authService.signup(req);

            // ✅ 세션에는 공통 MeResponse 형태로 저장 (role 포함)
            MeResponse sessionUser = new MeResponse(
                    res.getId(),
                    res.getName(),
                    res.getEmail(),
                    res.getRole()
            );
            session.setAttribute(SESSION_USER_KEY, sessionUser);

            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            // 예: 이메일 중복 등의 경우 400으로 에러 메시지를 반환한다.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 로그인
     * - 이메일과 비밀번호로 로그인한다.
     * - 성공 시 세션ID를 재발급하고, 세션에 사용자 정보를 저장한다.
     */
    @Operation(
            summary = "로그인",
            description = "이메일과 비밀번호로 로그인합니다.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(examples = {
                            @ExampleObject(
                                    name = "로그인 예시",
                                    value = """
                                            {
                                              "email": "test@test.com",
                                              "password": "test1234"
                                            }
                                            """
                            )
                    })
            )
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @org.springframework.web.bind.annotation.RequestBody UserLoginRequest req,
            HttpServletRequest httpReq,
            HttpSession session
    ) {
        try {
            // 서비스 계층에 로그인 처리를 요청한다.
            UserLoginResponse res = authService.login(req);

            // 세션 고정 공격을 막기 위해 로그인 직후 세션ID를 재발급한다.
            httpReq.changeSessionId();

            // ✅ 세션에는 공통 MeResponse 형태로 저장 (role 포함)
            MeResponse sessionUser = new MeResponse(
                    res.getId(),
                    res.getName(),
                    res.getEmail(),
                    res.getRole()
            );
            session.setAttribute(SESSION_USER_KEY, sessionUser);

            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            // 이메일 또는 비밀번호가 틀린 경우 401을 반환한다.
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    /**
     * 현재 로그인된 사용자 조회
     * - 세션에 저장된 사용자 정보가 있으면 그대로 반환한다.
     * - 없으면 null을 반환한다.
     */
    @Operation(
            summary = "현재 사용자",
            description = "로그인되어 있으면 사용자 정보를, 아니면 null을 반환합니다."
    )
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(HttpSession session) {
        MeResponse user = (MeResponse) session.getAttribute(SESSION_USER_KEY);
        // 로그인하지 않은 경우에도 200 응답에 null을 담아 보낸다.
        return ResponseEntity.ok(user);
    }

    /**
     * 로그아웃
     * - 세션을 종료하고 리프레시 토큰 쿠키를 만료시킨다.
     */
    @Operation(
            summary = "로그아웃",
            description = "세션을 종료하고 리프레시 쿠키를 삭제합니다."
    )
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session, HttpServletResponse response) {
        // 세션 전체를 무효화한다.
        session.invalidate();

        // 리프레시 토큰 쿠키를 즉시 만료시킨다.
        expireCookie(response, REFRESH_COOKIE);

        // 필요하다면 JSESSIONID도 강제로 만료시킬 수 있다.
        // expireCookie(response, "JSESSIONID");

        return ResponseEntity.ok().build();
    }

    // 내부 유틸: 같은 이름의 쿠키를 0초로 설정해 즉시 만료 처리한다.
    private void expireCookie(HttpServletResponse response, String name) {
        Cookie c = new Cookie(name, "");
        c.setPath("/");          // 굽던 때와 동일한 path를 맞춘다.
        c.setMaxAge(0);          // 0초로 설정하면 즉시 만료된다.
        c.setHttpOnly(true);     // JavaScript에서 접근하지 못하도록 막는다.
        // 로컬 개발(HTTP)에서는 false, HTTPS 배포 환경에서는 true로 설정한다.
        c.setSecure(false);
        // SameSite 속성을 Lax로 설정한다.
        c.setAttribute("SameSite", "Lax");
        response.addCookie(c);
    }
    // 1) 회원정보 수정 /api/auth/me (POST)
    @PostMapping("/me")
    public ResponseEntity<?> updateMe(
            @org.springframework.web.bind.annotation.RequestBody UpdateMeRequest req,
            HttpSession session
    ) {
        MeResponse sessionUser = (MeResponse) session.getAttribute(SESSION_USER_KEY);
        if (sessionUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            MeResponse updated = authService.updateMe(
                    sessionUser.getId(),
                    req.getName(),
                    req.getEmail()
            );
            session.setAttribute(SESSION_USER_KEY, updated);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2) 비밀번호 변경 /api/auth/change-password
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @org.springframework.web.bind.annotation.RequestBody ChangePasswordRequest req,
            HttpSession session
    ) {
        MeResponse sessionUser = (MeResponse) session.getAttribute(SESSION_USER_KEY);
        if (sessionUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            authService.changePassword(
                    sessionUser.getId(),
                    req.getCurrentPassword(),
                    req.getNewPassword()
            );
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
