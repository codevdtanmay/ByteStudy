package com.bytepath.service;

import com.bytepath.model.*;
import com.bytepath.repository.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.*;

@Service
public class AccountEmailService {
    private final UserRepository users; private final AccountTokenRepository tokens;
    private final PendingRegistrationRepository pending; private final ObjectProvider<JavaMailSender> mail;
    private final String frontendUrl;
    public AccountEmailService(UserRepository users, AccountTokenRepository tokens, PendingRegistrationRepository pending,
                               ObjectProvider<JavaMailSender> mail, @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.users=users; this.tokens=tokens; this.pending=pending; this.mail=mail; this.frontendUrl=frontendUrl;
    }
    @Transactional public void issueRegistration(PendingRegistration registration) {
        String raw=Base64.getUrlEncoder().withoutPadding().encodeToString(SecureRandom.getSeed(48));
        registration.setTokenHash(hash(raw)); registration.setExpiresAt(Instant.now().plusSeconds(3600)); pending.save(registration);
        JavaMailSender sender=mail.getIfAvailable(); if(sender==null) throw new IllegalStateException("Email delivery is not configured. Please try again later.");
        SimpleMailMessage msg=new SimpleMailMessage(); msg.setTo(registration.getEmail()); msg.setSubject("Verify your BytePath email");
        msg.setText("Verify your BytePath account within one hour:\n\n"+frontendUrl+"/?verifyToken="+raw+"\n\nIf you did not request this, you can ignore this email."); sender.send(msg);
    }
    @Transactional public PendingRegistration consumeRegistration(String raw) {
        PendingRegistration registration=pending.findByTokenHash(hash(raw)).orElseThrow(() -> new SecurityException("This verification link is invalid."));
        if(registration.getExpiresAt().isBefore(Instant.now())) { pending.delete(registration); throw new SecurityException("This verification link has expired."); }
        pending.delete(registration); return registration;
    }
    @Transactional public void issueVerification(User user) { issue(user,"VERIFY_EMAIL","verify"); }
    @Transactional public void requestReset(String email) { users.findByEmail(email.trim().toLowerCase()).ifPresent(user -> issue(user,"RESET_PASSWORD","reset")); }
    @Transactional public void verify(String raw) { AccountToken t=find(raw,"VERIFY_EMAIL"); t.setUsed(true); t.getUser().setEmailVerified(true); users.save(t.getUser()); tokens.save(t); }
    @Transactional public void reset(String raw,String password,org.springframework.security.crypto.password.PasswordEncoder encoder) { AccountToken t=find(raw,"RESET_PASSWORD"); t.getUser().setPasswordHash(encoder.encode(password)); t.setUsed(true); users.save(t.getUser()); tokens.save(t); }
    private void issue(User user,String purpose,String action) { String raw=Base64.getUrlEncoder().withoutPadding().encodeToString(SecureRandom.getSeed(48)); tokens.save(AccountToken.builder().user(user).purpose(purpose).tokenHash(hash(raw)).expiresAt(Instant.now().plusSeconds(3600)).used(false).build()); JavaMailSender sender=mail.getIfAvailable(); if(sender==null)return; SimpleMailMessage msg=new SimpleMailMessage(); msg.setTo(user.getEmail()); msg.setSubject("BytePath account security"); msg.setText("Use this one-time token for "+action+": "+raw); sender.send(msg); }
    private AccountToken find(String raw,String purpose) { AccountToken t=tokens.findByTokenHash(hash(raw)).orElseThrow(() -> new SecurityException("Account token is invalid.")); if(t.isUsed()||!purpose.equals(t.getPurpose())||t.getExpiresAt().isBefore(Instant.now()))throw new SecurityException("Account token is expired."); return t; }
    private String hash(String v) { try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(v.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);} }
}
