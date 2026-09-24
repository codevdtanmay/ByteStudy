package com.bytepath.dto.response;

import com.bytepath.model.StudentVideoLink;

import java.time.Instant;

public record StudentVideoLinkResponse(
        Long id,
        int semesterNumber,
        String courseCode,
        String url,
        String title,
        Instant createdAt) {
    public static StudentVideoLinkResponse from(StudentVideoLink video) {
        return new StudentVideoLinkResponse(video.getId(), video.getSemesterNumber(), video.getCourseCode(), video.getUrl(), video.getTitle(), video.getCreatedAt());
    }
}
