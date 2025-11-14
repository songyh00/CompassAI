package com.compassai.backend.tool.repository;

import com.compassai.backend.tool.domain.AiToolApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AiToolApplicationRepository extends JpaRepository<AiToolApplication, Long> {

    /**
     * 관리자용 전체 신청 목록 조회
     * - applicant (신청자)
     * - categories (조인 테이블 → 카테고리)
     * 를 fetch join 으로 한 번에 불러오기
     */
    @Query("""
        select distinct a
        from AiToolApplication a
        join fetch a.applicant u
        left join fetch a.categories ac
        left join fetch ac.category c
        order by a.appliedAt desc
        """)
    List<AiToolApplication> findAllWithApplicantAndCategories();
}
