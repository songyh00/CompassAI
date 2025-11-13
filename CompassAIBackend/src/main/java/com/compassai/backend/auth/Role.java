package com.compassai.backend.auth;

// 유저 권한을 문자열이 아닌 enum으로 관리하기 위한 타입
public enum Role {
    USER,   // 일반 사용자
    ADMIN   // 관리자
}
