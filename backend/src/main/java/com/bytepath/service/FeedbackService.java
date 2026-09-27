package com.bytepath.service;

import com.bytepath.dto.request.FeedbackRequest;
import com.bytepath.dto.response.FeedbackResponse;
import com.bytepath.model.Feedback;
import com.bytepath.model.User;
import com.bytepath.repository.FeedbackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service encapsulating student feedback collection and administrative review.
 */
@Service
public class FeedbackService {

    private static final Logger log = LoggerFactory.getLogger(FeedbackService.class);

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    /**
     * Submit new student feedback.
     */
    @Transactional
    public FeedbackResponse submitFeedback(User user, FeedbackRequest request) {
        log.info("Recording student feedback from user='{}', type='{}'", user.getLoginId(), request.getType());

        Feedback feedback = Feedback.builder()
                .user(user)
                .type(request.getType().trim())
                .message(request.getMessage().trim())
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        return FeedbackResponse.from(saved);
    }

    /**
     * Retrieve all submitted feedback for administrative inspection.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(FeedbackResponse::from)
                .toList();
    }
}
