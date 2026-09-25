package com.bytepath;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.bytepath.model.User;
import com.bytepath.repository.UserRepository;

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
            @Value("${admin.email}") String adminEmail,
            @Value("${admin.name}") String adminName) {
        return args -> userRepository.findByEmail(adminEmail.trim().toLowerCase())
            .ifPresentOrElse(user -> {
                if (user.getRole() != User.Role.ADMIN) {
                    user.setRole(User.Role.ADMIN);
                    userRepository.save(user);
                }
            }, () -> userRepository.save(User.builder()
                .loginId(adminEmail.trim().toLowerCase())
                .name(adminName)
                .email(adminEmail.trim().toLowerCase())
                .role(User.Role.ADMIN)
                .build()));
    }
}
