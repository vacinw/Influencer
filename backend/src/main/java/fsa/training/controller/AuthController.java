package fsa.training.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import fsa.training.dao.UserDao;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping("/token")
    public ResponseEntity<?> getTokenFromCookie(HttpServletRequest request, HttpServletResponse response) {
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("AUTH_TOKEN".equals(cookie.getName())) {
                    token = cookie.getValue();
                    // Clear the cookie after reading
                    cookie.setMaxAge(0);
                    cookie.setPath("/");
                    response.addCookie(cookie);
                    break;
                }
            }
        }

        if (token != null) {
            Map<String, String> res = new HashMap<>();
            res.put("token", token);
            return ResponseEntity.ok(res);
        } else {
            // Return 200 with null token to avoid 401 errors in console (expected flow for unauth users)
            return ResponseEntity.ok(Collections.singletonMap("token", null));
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }

        // Get email from authentication principal
        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
            email = ((org.springframework.security.oauth2.core.user.OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else {
            email = authentication.getName();
        }

        // Fetch fresh user data from database
        fsa.training.entity.User user = userDao.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        }

        Map<String, Object> roleMap = new HashMap<>();
        if (user.getRole() != null) {
            roleMap.put("id", user.getRole().getId());
            roleMap.put("name", user.getRole().getName());
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("role", user.getRole() != null ? roleMap : null);
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("bio", user.getBio());
        response.put("phone", user.getPhone());
        response.put("socialLinks", user.getSocialLinks());
        response.put("isVerified", user.getVerified());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập Email."));
        }

        fsa.training.entity.User user = userDao.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không tồn tại trong hệ thống."));
        }

        // Generate a random 8-character password
        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        
        // Update user
        user.setPassword(passwordEncoder.encode(newPassword));
        userDao.save(user);

        // Send Email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("nguyenthitam05102003@gmail.com");
            message.setTo(user.getEmail());
            message.setSubject("Mật khẩu mới của bạn - InfluConnect");
            message.setText("Chào " + user.getName() + ",\n\nMật khẩu đăng nhập tạm thời của bạn là: " + newPassword + "\n\nVui lòng đăng nhập và bảo quản cẩn thận!\n\nTrân trọng,\nInfluConnect Team");
            mailSender.send(message);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi phát tín hiệu gửi email. Vui lòng thử lại sau."));
        }

        return ResponseEntity.ok(Map.of("message", "Mật khẩu mới ghép đã được gửi vào email của bạn."));
    }

    @org.springframework.web.bind.annotation.PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload, org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Bạn chưa đăng nhập"));
        }

        fsa.training.entity.User userDetails = (fsa.training.entity.User) authentication.getPrincipal();
        fsa.training.entity.User dbUser = userDao.findById(userDetails.getId()).orElse(null);
        if (dbUser == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy người dùng"));
        }

        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu mới phải có ít nhất 6 ký tự"));
        }

        // Verify current password if user has one (handles edge-case of OAuth users w/o password changing logic gracefully if they somehow got here)
        if (dbUser.getPassword() != null && !dbUser.getPassword().isEmpty() && !dbUser.getPassword().equals("OAUTH_USER")) {
            if (currentPassword == null || !passwordEncoder.matches(currentPassword, dbUser.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu hiện tại không đúng"));
            }
        }

        dbUser.setPassword(passwordEncoder.encode(newPassword));
        userDao.save(dbUser);
        
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
