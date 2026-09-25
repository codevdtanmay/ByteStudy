package com.bytepath.controller;
import com.bytepath.service.AccountEmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/auth")
public class AccountSecurityController {
 private final AccountEmailService email; private final PasswordEncoder encoder;
 public AccountSecurityController(AccountEmailService email, PasswordEncoder encoder){this.email=email;this.encoder=encoder;}
 @PostMapping("/password-reset/request") public ResponseEntity<Void> request(@RequestBody Map<String,String> b){email.requestReset(b.getOrDefault("email",""));return ResponseEntity.noContent().build();}
 @PostMapping("/password-reset/confirm") public ResponseEntity<Void> reset(@RequestBody Map<String,String> b){String p=b.getOrDefault("password","");if(p.length()<8)throw new IllegalArgumentException("Password must be at least 8 characters.");email.reset(b.getOrDefault("token",""),p,encoder);return ResponseEntity.noContent().build();}
}
