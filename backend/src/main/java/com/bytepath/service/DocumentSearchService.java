package com.bytepath.service;

import com.bytepath.model.DocumentChunk;
import com.bytepath.model.PyqResource;
import com.bytepath.model.User;
import com.bytepath.repository.DocumentChunkRepository;
import com.bytepath.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Small, dependency-free retrieval layer. It uses token overlap today so the
 * pipeline works on a normal PostgreSQL instance; a vector index can be added
 * later without changing the upload or advisor APIs.
 */
@Service
public class DocumentSearchService {
    private static final int CHUNK_SIZE = 1200;
    private static final int CHUNK_OVERLAP = 180;
    private static final Pattern TOKEN = Pattern.compile("[a-z0-9]{2,}");
    private static final Set<String> STOP_WORDS = Set.of("the", "and", "for", "with", "what", "how", "why", "from", "this", "that", "are", "can", "tell", "about", "does", "your");

    private final DocumentChunkRepository chunkRepository;
    private final SubscriptionRepository subscriptionRepository;

    public DocumentSearchService(DocumentChunkRepository chunkRepository,
                                 SubscriptionRepository subscriptionRepository) {
        this.chunkRepository = chunkRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional
    public int index(PyqResource resource, String extractedText) {
        chunkRepository.deleteByResource(resource);
        if (extractedText == null || extractedText.isBlank()) return 0;

        String normalized = extractedText.replace("\r", "").replaceAll("[ \\t]+", " ").trim();
        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < normalized.length()) {
            int end = Math.min(start + CHUNK_SIZE, normalized.length());
            if (end < normalized.length()) {
                int boundary = normalized.lastIndexOf('\n', end);
                if (boundary < start + CHUNK_SIZE / 2) boundary = normalized.lastIndexOf(' ', end);
                if (boundary > start) end = boundary;
            }
            String chunk = normalized.substring(start, end).trim();
            if (!chunk.isBlank()) chunks.add(chunk);
            if (end >= normalized.length()) break;
            start = Math.max(end - CHUNK_OVERLAP, start + 1);
        }

        List<DocumentChunk> entities = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            entities.add(DocumentChunk.builder().resource(resource).chunkIndex(i).content(chunks.get(i)).build());
        }
        chunkRepository.saveAll(entities);
        return entities.size();
    }

    public String retrieve(String question, User user, int limit) {
        Set<String> queryTokens = tokens(question);
        if (queryTokens.isEmpty()) return "";

        boolean subscribed = user.getRole() == User.Role.ADMIN || user.isHasEndSemSubscription()
            || subscriptionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .anyMatch(subscription -> subscription.isActive(java.time.Instant.now()));

        return chunkRepository.findAll().stream()
            .filter(chunk -> "FREE".equalsIgnoreCase(chunk.getResource().getAccessLevel()) || subscribed)
            .map(chunk -> new ScoredChunk(chunk, score(chunk, queryTokens)))
            .filter(item -> item.score > 0)
            .sorted(Comparator.comparingInt(ScoredChunk::score).reversed())
            .limit(limit)
            .map(item -> "[" + item.chunk.getResource().getTitle() + "]\n" + item.chunk.getContent())
            .reduce((a, b) -> a + "\n\n" + b)
            .orElse("");
    }

    private int score(DocumentChunk chunk, Set<String> queryTokens) {
        Set<String> chunkTokens = tokens(chunk.getContent());
        int overlap = 0;
        for (String token : queryTokens) if (chunkTokens.contains(token)) overlap++;
        String content = chunk.getContent().toLowerCase(Locale.ROOT);
        return overlap * 10 + (content.contains(String.join(" ", queryTokens)) ? 5 : 0);
    }

    private Set<String> tokens(String text) {
        Set<String> result = new HashSet<>();
        var matcher = TOKEN.matcher(text == null ? "" : text.toLowerCase(Locale.ROOT));
        while (matcher.find()) {
            String token = matcher.group();
            if (!STOP_WORDS.contains(token)) result.add(token);
        }
        return result;
    }

    private record ScoredChunk(DocumentChunk chunk, int score) {}
}
