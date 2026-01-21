package fsa.training.controller;

import fsa.training.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fsa.training.dao.UserDao;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserDao userDao;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        Object principal = auth.getPrincipal();
        User user = null;

        if (principal instanceof User) {
            // Standard Spring Security User (from DB)
            User principalUser = (User) principal;
            // Refresh from DB to get latest
            user = userDao.findById(principalUser.getId()).orElse(principalUser);

        } else if (principal instanceof OAuth2User) {
            // Google generic User
            OAuth2User oauth2User = (OAuth2User) principal;
            String email = oauth2User.getAttribute("email");
            user = userDao.findByEmail(email);
        }

        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }

        return ResponseEntity.ok(user);
    }
}
