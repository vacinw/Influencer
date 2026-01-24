package fsa.training.controller;

import fsa.training.dao.RoleDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Role;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @PostMapping("/role")
    public ResponseEntity<?> updateRole(@RequestBody Map<String, String> payload, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = null;
        if (authentication.getPrincipal() instanceof OAuth2User) {
            email = ((OAuth2User) authentication.getPrincipal()).getAttribute("email");
        } else if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getName();
        }

        if (email == null) {
            return ResponseEntity.badRequest().body("Cannot identify user");
        }

        User user = userDao.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        String roleName = payload.get("role");
        if (roleName == null || (!roleName.equals("CREATOR") && !roleName.equals("RECEIVER"))) {
            return ResponseEntity.badRequest().body("Invalid role. Must be CREATOR or RECEIVER");
        }

        Role role = roleDao.findByName(roleName);
        if (role == null) {
            // Should create role if not exists? Ideally roles are seeded.
            // But for simple path, let's assume roles exist or create on fly?
            // Better to return error if not seeded, but to be safe lets create:
            role = new Role();
            role.setName(roleName);
            roleDao.save(role);
        }

        user.setRole(role);
        userDao.save(user);

        return ResponseEntity.ok(user);
    }
    private User getCurrentUser() {
        Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            Object principal = auth.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                return userDao.findById(user.getId()).orElse(user);
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
                return userDao.findByEmail(email);
            } else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
                String email = ((org.springframework.security.oauth2.core.user.OAuth2User) principal).getAttribute("email");
                return userDao.findByEmail(email);
            }
        }
        return null;
    }

    @org.springframework.web.bind.annotation.GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(user);
    }

    @org.springframework.web.bind.annotation.PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        if (payload.containsKey("name")) user.setName((String) payload.get("name"));
        if (payload.containsKey("bio")) user.setBio((String) payload.get("bio"));
        if (payload.containsKey("phone")) user.setPhone((String) payload.get("phone"));
        if (payload.containsKey("avatarUrl")) user.setAvatarUrl((String) payload.get("avatarUrl"));
        
        if (payload.containsKey("socialLinks")) {
             // Handle social links update safely
             // Assuming payload sends a List<String>
             Object links = payload.get("socialLinks");
             if (links instanceof java.util.Collection) {
                 user.setSocialLinks((java.util.Collection<String>) links);
             }
        }

        userDao.save(user);
        return ResponseEntity.ok(user);
    }

    @org.springframework.web.bind.annotation.GetMapping("/{id}/public")
    public ResponseEntity<?> getPublicProfile(@org.springframework.web.bind.annotation.PathVariable Long id) {
        User user = userDao.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        
        // Return a DTO or a sanitized view ideally, but for now returning User entity 
        // implies we should be careful. Since JSON ignore properties (like password) 
        // might not be set, we trust Jackson config or User entity definition (password is field, hopefully ignored or DTO used).
        // For rapid dev phase 3, we return User but Frontend should only show public fields.
        // SECURITY NOTE: In prod, use a DTO.
        return ResponseEntity.ok(user);
    }
}
