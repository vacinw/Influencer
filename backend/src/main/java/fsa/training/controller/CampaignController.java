package fsa.training.controller;

import fsa.training.dao.CampaignDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Campaign;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/campaign")
public class CampaignController {

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private UserDao userDao;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            // In JWT/Stateless, principal might be string or UserDetails.
            // If using DaoAuthenticationProvider, it is User or UserDetails.
            Object principal = auth.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                return userDao.findById(user.getId()).orElse(user);
            } else if (principal instanceof UserDetails) {
                String email = ((UserDetails) principal).getUsername();
                return userDao.findByEmail(email);
            }
        }
        return null;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCampaign(@RequestBody Campaign campaign) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body("Bạn cần đăng nhập để tạo chiến dịch!");
            }
            campaign.setCreator(currentUser);

            // Tags and Platforms are already in the list if sent via JSON properly.
            // No need to split string manually if frontend sends array.
            // If frontend sends strings, we keep logic.
            // Assuming simplified JSON array input for now.

            if (campaign.getStatus() == null || campaign.getStatus().isEmpty()) {
                campaign.setStatus("Đang tuyển");
            }

            campaignDao.save(campaign);
            return ResponseEntity.ok(campaign);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo chiến dịch: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCampaign(@PathVariable Long id) {
        Campaign campaign = campaignDao.findById(id).orElse(null);
        if (campaign == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(campaign);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(@PathVariable Long id, @RequestBody Campaign campaignRequest) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            Campaign existingCampaign = campaignDao.findById(id).orElse(null);
            if (existingCampaign == null) {
                return ResponseEntity.notFound().build();
            }

            // Check permission: owner or ADMIN
            if (existingCampaign.getCreator() != null
                    && !existingCampaign.getCreator().getId().equals(currentUser.getId()) &&
                    (currentUser.getRole() == null || !currentUser.getRole().getName().equals("ADMIN"))) {
                return ResponseEntity.status(403).body("Bạn không có quyền sửa chiến dịch này!");
            }

            // Update fields
            existingCampaign.setTitle(campaignRequest.getTitle());
            existingCampaign.setDescription(campaignRequest.getDescription());
            existingCampaign.setImageUrl(campaignRequest.getImageUrl());
            existingCampaign.setDeadline(campaignRequest.getDeadline());
            existingCampaign.setStatus(campaignRequest.getStatus());
            existingCampaign.setTags(campaignRequest.getTags());
            existingCampaign.setPlatforms(campaignRequest.getPlatforms());

            campaignDao.save(existingCampaign);
            return ResponseEntity.ok(existingCampaign);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi cập nhật chiến dịch: " + e.getMessage());
        }
    }
}
