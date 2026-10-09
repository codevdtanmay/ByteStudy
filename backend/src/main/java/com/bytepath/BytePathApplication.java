package com.bytepath;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.bytepath.model.User;
import com.bytepath.repository.UserRepository;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * BytePath Backend — Spring Boot Entry Point
 * <p>
 * Starts the embedded Tomcat server on port 8080.
 * Swagger UI: http://localhost:8080/swagger-ui.html
 * H2 Console:  http://localhost:8080/h2-console
 */
@SpringBootApplication
public class BytePathApplication {

    public static void main(String[] args) {
        SpringApplication.run(BytePathApplication.class, args);
    }

    @Bean
    CommandLineRunner seedAdmin(
            UserRepository userRepository,
            @Value("${admin.emails:}") String adminEmails,
            @Value("${admin.name}") String adminName) {
        Set<String> configuredEmails = Arrays.stream(adminEmails == null ? new String[0] : adminEmails.split(","))
            .map(String::trim)
            .map(String::toLowerCase)
            .filter(email -> !email.isBlank())
            .collect(Collectors.toSet());
        if (configuredEmails.isEmpty()) {
            throw new IllegalStateException("ADMIN_EMAILS (or ADMIN_EMAIL) must be configured before starting the backend.");
        }
        return args -> {
            configuredEmails.forEach(email -> userRepository.findByEmail(email).ifPresentOrElse(user -> {
                if (user.getRole() != User.Role.ADMIN) {
                    user.setRole(User.Role.ADMIN);
                    userRepository.save(user);
                }
            }, () -> userRepository.save(User.builder()
                .loginId(email)
                .name(adminName)
                .email(email)
                .emailVerified(true)
                .role(User.Role.ADMIN)
                .build())));
        };
    }
}
