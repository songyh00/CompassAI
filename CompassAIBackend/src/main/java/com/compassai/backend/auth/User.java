package com.compassai.backend.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// users 테이블과 매핑되는 엔티티
@Entity
@Getter
@Setter
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 사용자 이름
    @Column(nullable = false, length = 50)
    private String name;

    // 로그인에 사용하는 이메일, 유니크 인덱스
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // 암호화된 비밀번호
    @Column(nullable = false, length = 255)
    private String password;

    // 권한 정보, enum을 문자열로 저장한다
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;

    // 생성 시각
    // DB에서 DEFAULT CURRENT_TIMESTAMP로 채우도록 하고
    // JPA는 INSERT/UPDATE 시 이 칼럼을 건드리지 않도록 설정한다
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
