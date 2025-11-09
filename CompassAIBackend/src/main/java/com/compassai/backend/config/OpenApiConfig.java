package com.compassai.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(title = "CompassAI API", version = "v1", description = "로컬 개발용 API 문서")
)
@Configuration
public class OpenApiConfig { }
