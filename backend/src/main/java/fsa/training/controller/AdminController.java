package fsa.training.controller;

import fsa.training.dao.CampaignDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Campaign;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import fsa.training.dao.RoleDao;
import fsa.training.entity.Role;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return ResponseEntity.ok((User) auth.getPrincipal());
        }
        return ResponseEntity.status(401).body("Unauthorized");
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userDao.findAll());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        User user = userDao.findById(id).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();

        if (payload.containsKey("enabled")) {
            user.setEnabled(payload.get("enabled"));
            userDao.save(user);
        }
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userDao.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (userDao.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setName(payload.get("name"));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(payload.get("password")));
        user.setEnabled(true);
        user.setVerified(true);

        String roleName = payload.get("role");
        if (roleName != null) {
            Role role = roleDao.findByName(roleName);
            if (role != null) {
                user.setRole(role);
            }
        }

        userDao.save(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userDao.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (payload.containsKey("name")) {
            user.setName(payload.get("name"));
        }
        if (payload.containsKey("email")) {
            String newEmail = payload.get("email");
            if (!newEmail.equals(user.getEmail()) && userDao.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            user.setEmail(newEmail);
        }
        if (payload.containsKey("password") && !payload.get("password").isEmpty()) {
            user.setPassword(passwordEncoder.encode(payload.get("password")));
        }
        if (payload.containsKey("role")) {
            String roleName = payload.get("role");
            Role role = roleDao.findByName(roleName);
            if (role != null) {
                user.setRole(role);
            }
        }

        userDao.save(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/campaigns")
    public ResponseEntity<?> getAllCampaigns() {
        return ResponseEntity.ok(campaignDao.findAll());
    }

    @PostMapping("/campaigns")
    public ResponseEntity<?> createCampaign(@RequestBody Map<String, String> payload) {
        Campaign campaign = new Campaign();
        campaign.setTitle(payload.get("title"));
        campaign.setDescription(payload.get("description"));
        campaign.setStatus(payload.get("status") != null ? payload.get("status") : "Active");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            campaign.setCreator((User) auth.getPrincipal());
        }

        campaignDao.save(campaign);
        return ResponseEntity.ok(campaign);
    }

    @PutMapping("/campaigns/{id}")
    public ResponseEntity<?> updateCampaignInfo(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Campaign campaign = campaignDao.findById(id).orElse(null);
        if (campaign == null)
            return ResponseEntity.notFound().build();

        if (payload.containsKey("title")) {
            campaign.setTitle(payload.get("title"));
        }
        if (payload.containsKey("description")) {
            campaign.setDescription(payload.get("description"));
        }
        if (payload.containsKey("status")) {
            campaign.setStatus(payload.get("status"));
        }

        campaignDao.save(campaign);
        return ResponseEntity.ok(campaign);
    }

    @DeleteMapping("/campaigns/{id}")
    public ResponseEntity<?> deleteCampaign(@PathVariable Long id) {
        if (!campaignDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        campaignDao.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/campaigns/{id}/status")
    public ResponseEntity<?> updateCampaignStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Campaign campaign = campaignDao.findById(id).orElse(null);
        if (campaign == null)
            return ResponseEntity.notFound().build();

        if (payload.containsKey("status")) {
            campaign.setStatus(payload.get("status"));
            campaignDao.save(campaign);
        }
        return ResponseEntity.ok(campaign);
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        long totalUsers = userDao.count();
        long totalCampaigns = campaignDao.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeCampaigns", totalCampaigns);
        stats.put("totalRevenue", 4500000); // Mock revenue

        return ResponseEntity.ok(stats);
    }
}
