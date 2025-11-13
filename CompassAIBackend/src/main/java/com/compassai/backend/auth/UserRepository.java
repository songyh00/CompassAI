package com.compassai.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// 유저 엔티티를 DB와 연결해 주는 리포지토리
public interface UserRepository extends JpaRepository<User, Long> {

    // 이메일 중복 여부 확인용 메서드
    boolean existsByEmail(String email);

    // 이메일로 유저 조회용 메서드
    Optional<User> findByEmail(String email);
}
