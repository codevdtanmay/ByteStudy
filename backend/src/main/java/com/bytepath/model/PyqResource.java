package com.bytepath.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * A PYQ (Previous Year Question paper) or study resource
 * uploaded by an admin.
 */
@Entity
@Table(name = "pyq_resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PyqResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    /** Legacy URL field; new resources use a private Supabase Storage object key. */
    @Column(length = 1000)
    private String url;

    @Column(name = "object_key", length = 512)
    private String objectKey;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING";

    @Builder.Default
    @Column(name = "access_level", nullable = false)
    private String accessLevel = "SUBSCRIPTION";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    @JsonIgnore
    private User createdBy;

    /** Semester number this resource belongs to (1-8), or 0 for general. */
    @Column(name = "semester_number")
    @Builder.Default
    private int semesterNumber = 0;

    /** Course code this resource is for, e.g. "SET/CS/BT/C304". */
    @Column(name = "course_code")
    private String courseCode;

    /** Exam classification used by the in-app year picker. */
    @Column(name = "exam_type")
    private String examType;

    /** Academic/exam year, e.g. 2024. */
    @Column(name = "exam_year")
    private Integer examYear;

    /** pdf | link | video | notes */
    @Builder.Default
    private String type = "pdf";

    @JsonIgnore
    @Column(name = "ocr_text", columnDefinition = "TEXT")
    private String ocrText;

    @Column(name = "uploaded_at")
    @Builder.Default
    private Instant uploadedAt = Instant.now();
}
