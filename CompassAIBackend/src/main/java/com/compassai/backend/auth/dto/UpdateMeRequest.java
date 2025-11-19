package com.compassai.backend.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMeRequest {
    private String name;
    private String email;
}
