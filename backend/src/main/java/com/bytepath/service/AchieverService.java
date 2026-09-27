package com.bytepath.service;

import com.bytepath.dto.request.AchieverRequest;
import com.bytepath.exception.ResourceNotFoundException;
import com.bytepath.model.HnbguAchiever;
import com.bytepath.repository.HnbguAchieverRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service encapsulating HNBGU Student Achievers showcase and administration business logic.
 */
@Service
public class AchieverService {

    private static final Logger log = LoggerFactory.getLogger(AchieverService.class);

    private final HnbguAchieverRepository achieverRepository;

    public AchieverService(HnbguAchieverRepository achieverRepository) {
        this.achieverRepository = achieverRepository;
    }

    /**
     * Retrieve all achievers sorted chronologically by creation timestamp descending.
     */
    @Transactional(readOnly = true)
    public List<HnbguAchiever> getAllAchievers() {
        return achieverRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Add or update an achiever profile with validated payload.
     */
    @Transactional
    public HnbguAchiever saveAchiever(AchieverRequest request) {
        log.info("Persisting HNBGU Achiever: name='{}', batch='{}', branch='{}'",
                request.getName(), request.getBatch(), request.getBranch());

        HnbguAchiever achiever;
        if (request.getId() != null) {
            achiever = achieverRepository.findById(request.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Achiever", "id", request.getId()));
        } else {
            achiever = new HnbguAchiever();
        }

        achiever.setName(request.getName().trim());
        achiever.setBranch(request.getBranch().trim());
        achiever.setBatch(request.getBatch().trim());
        achiever.setCgpa(request.getCgpa() != null ? request.getCgpa().trim() : null);
        achiever.setAchievementTitle(request.getAchievementTitle().trim());
        achiever.setQuote(request.getQuote() != null ? request.getQuote().trim() : null);
        achiever.setCompanyOrExam(request.getCompanyOrExam() != null ? request.getCompanyOrExam().trim() : null);
        achiever.setPhotoUrl(request.getPhotoUrl() != null ? request.getPhotoUrl().trim() : null);
        achiever.setBadgeLabel(request.getBadgeLabel() != null && !request.getBadgeLabel().isBlank()
                ? request.getBadgeLabel().trim()
                : "STAR ACHIEVER");

        return achieverRepository.save(achiever);
    }

    /**
     * Delete an achiever by identifier.
     */
    @Transactional
    public void deleteAchiever(Long id) {
        log.info("Deleting HNBGU Achiever id={}", id);
        if (!achieverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Achiever", "id", id);
        }
        achieverRepository.deleteById(id);
    }
}
