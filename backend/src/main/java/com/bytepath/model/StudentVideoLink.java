package com.bytepath.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "student_video_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentVideoLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "semester_number", nullable = false)
    private int semesterNumber;

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
