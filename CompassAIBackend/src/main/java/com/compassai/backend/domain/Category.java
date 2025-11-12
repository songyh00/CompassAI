package com.compassai.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category",
        uniqueConstraints = @UniqueConstraint(name = "uq_category_name", columnNames = "name"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 60, nullable = false)
    private String name;
}
