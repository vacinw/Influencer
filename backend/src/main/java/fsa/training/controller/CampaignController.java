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
            existingCampaign.setImages(campaignRequest.getImages());
            existingCampaign.setVideos(campaignRequest.getVideos());
            existingCampaign.setDeadline(campaignRequest.getDeadline());
            existingCampaign.setStatus(campaignRequest.getStatus());
            existingCampaign.setTags(campaignRequest.getTags());
            existingCampaign.setPlatforms(campaignRequest.getPlatforms());
            existingCampaign.setLayoutStyle(campaignRequest.getLayoutStyle());

            campaignDao.save(existingCampaign);
            return ResponseEntity.ok(existingCampaign);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi cập nhật chiến dịch: " + e.getMessage());
    }
    }

    @GetMapping("/my-campaigns")
    public ResponseEntity<?> getMyCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());

        org.springframework.data.jpa.domain.Specification<Campaign> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            
            // Filter by Creator (always)
            predicates.add(cb.equal(root.get("creator"), currentUser));

            // Filter by Status
            if (status != null && !status.isEmpty() && !status.equals("All")) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Filter by Search (Title)
            if (search != null && !search.isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("title")), likePattern));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        org.springframework.data.domain.Page<Campaign> resultPage = campaignDao.findAll(spec, pageable);
        return ResponseEntity.ok(resultPage);
    }
    @GetMapping("/public")
    public ResponseEntity<?> getPublicCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String platform
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());

        org.springframework.data.jpa.domain.Specification<Campaign> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            
            // Filter by Status: Only "Active" or "Đang tuyển"
            // We use an OR clause for these two valid open statuses
            jakarta.persistence.criteria.Predicate active = cb.equal(root.get("status"), "Active");
            jakarta.persistence.criteria.Predicate hiring = cb.equal(root.get("status"), "Đang tuyển");
            predicates.add(cb.or(active, hiring));

            // Filter by Search (Title or Description)
            if (search != null && !search.isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                jakarta.persistence.criteria.Predicate titleLike = cb.like(cb.lower(root.get("title")), likePattern);
                // jakarta.persistence.criteria.Predicate descLike = cb.like(cb.lower(root.get("description")), likePattern); // optional: search description too
                predicates.add(titleLike);
            }

            // Filter by Platform (check if platforms list contains the platform)
            // Note: In JPA/ElementCollection, this can be tricky. For simplicty with simple Specification, 
            // if platforms is @ElementCollection, we use join.
            // Assuming basic implementation for now. If issues arise, we will refine.
            if (platform != null && !platform.isEmpty() && !platform.equals("All")) {
                 predicates.add(cb.isMember(platform, root.get("platforms")));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        org.springframework.data.domain.Page<Campaign> resultPage = campaignDao.findAll(spec, pageable);
        return ResponseEntity.ok(resultPage);
    }
}
