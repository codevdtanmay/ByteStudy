package com.bytepath.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Server-side Gemini adapter. The API key never leaves the backend. */
@Service
public class GeminiClient {
    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiClient(RestClient.Builder builder, ObjectMapper objectMapper,
                        @Value("${gemini.api.key:}") String apiKey,
                        @Value("${gemini.model:gemini-2.5-flash}") String model) {
        this.restClient = builder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public Optional<String> ask(String systemPrompt, String userPrompt, int maxTokens) {
        if (apiKey.isBlank()) return Optional.empty();
        try {
            String response = restClient.post()
                .uri("/v1beta/models/{model}:generateContent", model)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-goog-api-key", apiKey)
                .body(Map.of(
                    "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                    "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))),
                    "generationConfig", Map.of("temperature", 0.55, "maxOutputTokens", maxTokens)))
                .retrieve().body(String.class);
            if (response == null || response.isBlank()) return Optional.empty();
            JsonNode parts = objectMapper.readTree(response).path("candidates").path(0)
                .path("content").path("parts");
            StringBuilder text = new StringBuilder();
            for (JsonNode part : parts) {
                String piece = part.path("text").asText("");
                if (!piece.isBlank()) {
                    if (!text.isEmpty()) text.append('\n');
                    text.append(piece);
                }
            }
            return text.isEmpty() ? Optional.empty() : Optional.of(text.toString().trim());
        } catch (Exception exception) {
            log.warn("Gemini request failed; using the application fallback", exception);
            return Optional.empty();
        }
    }
}
