package com.bytepath.service;

import com.bytepath.dto.request.StudentVideoLinkRequest;
import com.bytepath.dto.response.StudentVideoLinkResponse;
import com.bytepath.exception.BadRequestException;
import com.bytepath.exception.ForbiddenException;
import com.bytepath.exception.ResourceNotFoundException;
import com.bytepath.model.StudentVideoLink;
import com.bytepath.model.User;
import com.bytepath.repository.StudentVideoLinkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.List;

/**
 * Service orchestrating student YouTube playlist and tutorial curation.
 */
@Service
public class StudentVideoLinkService {

    private static final Logger log = LoggerFactory.getLogger(StudentVideoLinkService.class);

    private final StudentVideoLinkRepository repository;
    private final YoutubeMetadataService metadataService;

    public StudentVideoLinkService(StudentVideoLinkRepository repository, YoutubeMetadataService metadataService) {
        this.repository = repository;
        this.metadataService = metadataService;
    }

    /**
     * Retrieve all video links for a user in a specific academic semester.
     */
    @Transactional(readOnly = true)
    public List<StudentVideoLinkResponse> getForSemester(User user, int semesterNumber) {
        if (semesterNumber < 1 || semesterNumber > 8) {
            throw new BadRequestException("Semester number must be between 1 and 8.");
        }
        return repository.findByUserAndSemesterNumberOrderByCreatedAtDesc(user, semesterNumber).stream()
                .map(StudentVideoLinkResponse::from)
                .toList();
    }

    /**
     * Add and curate a new tutorial video link.
     */
    @Transactional
    public StudentVideoLinkResponse addVideoLink(User user, StudentVideoLinkRequest request) {
        String url = request.getUrl().trim();
        validateYoutubeUrl(url);

        if (request.getSemesterNumber() < 1 || request.getSemesterNumber() > 8) {
            throw new BadRequestException("Semester number must be between 1 and 8.");
        }

        log.info("Adding tutorial video for user='{}', semester={}, course='{}'",
                user.getLoginId(), request.getSemesterNumber(), request.getCourseCode());

        String title = metadataService.fetchTitle(url);

        StudentVideoLink video = StudentVideoLink.builder()
                .user(user)
                .semesterNumber(request.getSemesterNumber())
                .courseCode(request.getCourseCode().trim())
                .url(url)
                .title(title)
                .build();

        return StudentVideoLinkResponse.from(repository.save(video));
    }

    /**
     * Delete an existing video link, verifying ownership.
     */
    @Transactional
    public void deleteVideoLink(User user, Long id) {
        log.info("Deleting tutorial video id={} for user='{}'", id, user.getLoginId());
        StudentVideoLink video = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video link", "id", id));

        if (!video.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not authorized to delete this video link.");
        }

        repository.delete(video);
    }

    private void validateYoutubeUrl(String value) {
        try {
            URI uri = URI.create(value);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
            boolean isYoutube = host.equals("youtu.be") || host.equals("youtube.com") || host.endsWith(".youtube.com");
            if (!isYoutube || !List.of("http", "https").contains(scheme)) {
                throw new BadRequestException("Please provide a valid YouTube video or playlist URL.");
            }
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Please provide a valid YouTube video or playlist URL.");
        }
    }
}
