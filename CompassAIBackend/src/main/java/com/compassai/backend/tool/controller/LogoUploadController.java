package com.compassai.backend.tool.controller;

import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

/**
 * 로고 이미지 업로드 전용 컨트롤러
 * - 실제 파일은 CompassAIFrontend/public/logos 에 저장
 * - DB/프론트에는 "/logos/파일명" 형태의 경로만 저장
 */
@RestController
@RequestMapping("/api/tools")
public class LogoUploadController {

    // Backend 기준 작업 디렉토리가 CompassAI/CompassAIBackend 라고 가정
    private static final Path FRONTEND_PUBLIC =
            Paths.get("..", "CompassAIFrontend", "public");
    private static final Path LOGO_DIR = FRONTEND_PUBLIC.resolve("logos");

    @PostMapping("/logos")
    public LogoUploadResponse uploadLogo(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "빈 파일입니다.");
        }

        // ../CompassAIFrontend/public/logos 디렉터리 없으면 생성
        Files.createDirectories(LOGO_DIR);

        String original = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String ext = StringUtils.getFilenameExtension(original);
        if (ext == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "확장자를 알 수 없는 파일입니다.");
        }

        String newName = UUID.randomUUID() + "." + ext.toLowerCase();
        Path target = LOGO_DIR.resolve(newName);

        // 실제 파일 저장
        file.transferTo(target.toFile());

        // 프론트/DB에서 사용할 경로 (Vite가 public 기준으로 서빙)
        String url = "/logos/" + newName;

        return new LogoUploadResponse(url);
    }

    public record LogoUploadResponse(String url) {}
}
