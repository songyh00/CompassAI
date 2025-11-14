package com.compassai.backend.tool.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tools/logos")
public class LogoUploadController {

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadLogo(@RequestPart("file") MultipartFile file)
            throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "빈 파일은 업로드할 수 없습니다."));
        }

        // -------- 1) 새 파일 이름 만들기 (UUID + 확장자) --------
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.lastIndexOf('.') != -1) {
            ext = originalName.substring(originalName.lastIndexOf('.')); // ".png" 같은 확장자
        }
        String newFileName = UUID.randomUUID() + ext;

        // -------- 2) Frontend public 디렉터리 계산 --------
        // user.dir = C:\...\CompassAI\CompassAIBackend
        Path backendDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath();

        // C:\...\CompassAI\CompassAIFrontend\public
        Path publicDir = backendDir
                .getParent()                      // CompassAI
                .resolve("CompassAIFrontend")     // CompassAIFrontend
                .resolve("public");               // public

        // public 폴더가 없다면 생성 (있으면 그냥 통과)
        Files.createDirectories(publicDir);

        // 최종 저장 경로: public/<랜덤파일이름>.png
        Path target = publicDir.resolve(newFileName);

        // 실제 파일 저장
        file.transferTo(target.toFile());

        // React 에서 사용할 경로 (예: <img src="/abcdef.png" />)
        String publicPath = "/" + newFileName;

        // 필요하면 DB에 이 publicPath 를 그대로 넣으면 됨.
        return ResponseEntity.ok(Map.of("url", publicPath));
    }
}
