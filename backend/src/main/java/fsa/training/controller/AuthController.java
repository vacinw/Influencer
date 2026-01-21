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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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

        fsa.training.entity.User user = (fsa.training.entity.User) authentication.getPrincipal();
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

        return ResponseEntity.ok(response);
    }
}
