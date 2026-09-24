package com.bytepath.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class YoutubeMetadataService {
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public YoutubeMetadataService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String fetchTitle(String url) {
        try {
            String endpoint = "https://www.youtube.com/oembed?url=" + java.net.URLEncoder.encode(url, java.nio.charset.StandardCharsets.UTF_8) + "&format=json";
            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint)).timeout(Duration.ofSeconds(8)).GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) return "YouTube video";
            JsonNode payload = objectMapper.readTree(response.body());
            String title = payload.path("title").asText("").trim();
            return title.isBlank() ? "YouTube video" : title;
        } catch (Exception ignored) {
            return "YouTube video";
        }
    }
}
