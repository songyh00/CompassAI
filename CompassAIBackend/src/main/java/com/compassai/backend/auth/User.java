package com.compassai.backend.auth;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=50)
    private String name;

    @Column(nullable=false, unique=true, length=100)
    private String email;

    @Column(nullable=false, length=255)
    private String password; // 로컬용: 평문 저장
}
