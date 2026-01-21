package fsa.training.controller;

import fsa.training.dao.ApplicationDao;
import fsa.training.dao.CampaignDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Application;
import fsa.training.entity.Campaign;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/application")
public class ApplicationController {

    @Autowired
    private ApplicationDao applicationDao;

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private fsa.training.dao.JobDao jobDao;

    @Autowired
    private fsa.training.dao.MilestoneDao milestoneDao;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
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

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        // user role validation if needed (must be RECEIVER)
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            Long campaignId = Long.valueOf(payload.get("campaignId").toString());
            String message = (String) payload.get("message");
            Double bidAmount = null;
            if (payload.containsKey("bidAmount") && payload.get("bidAmount") != null) {
                String bidStr = payload.get("bidAmount").toString();
                if (!bidStr.isEmpty()) {
                    bidAmount = Double.valueOf(bidStr);
                }
            }

            Campaign campaign = campaignDao.findById(campaignId).orElse(null);
            if (campaign == null) {
                return ResponseEntity.badRequest().body("Campaign not found");
            }

            // Check if already applied
            if (applicationDao.findByCampaignAndReceiver(campaign, user).isPresent()) {
                return ResponseEntity.badRequest().body("You have already applied to this campaign");
            }

            Application app = new Application();
            app.setCampaign(campaign);
            app.setReceiver(user);
            app.setMessage(message);
            app.setBidAmount(bidAmount);
            app.setStatus("PENDING");
            
            applicationDao.save(app);
            return ResponseEntity.ok(app);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Application failed: " + e.getMessage());
        }
    }

    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<?> getCampaignApplications(@PathVariable Long campaignId) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Campaign campaign = campaignDao.findById(campaignId).orElse(null);
        if (campaign == null) {
            return ResponseEntity.notFound().build();
        }

        // Only Creator or Admin can view applications
        if (!campaign.getCreator().getId().equals(user.getId()) && !user.getRole().getName().equals("ADMIN")) {
            return ResponseEntity.status(403).body("Access denied");
        }

        List<Application> applications = applicationDao.findByCampaign(campaign);
        return ResponseEntity.ok(applications);
    }
    
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());

        org.springframework.data.jpa.domain.Specification<Application> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            
            // Filter by Receiver
            predicates.add(cb.equal(root.get("receiver"), user));

            // Filter by Status
            if (status != null && !status.isEmpty() && !status.equals("All")) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        org.springframework.data.domain.Page<Application> resultPage = applicationDao.findAll(spec, pageable);
        return ResponseEntity.ok(resultPage);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Application app = applicationDao.findById(id).orElse(null);
        if (app == null) {
            return ResponseEntity.notFound().build();
        }

        // Only Creator of the campaign can update status
        if (!app.getCampaign().getCreator().getId().equals(user.getId())) {
             return ResponseEntity.status(403).body("Access denied");
        }

        String newStatus = payload.get("status");
        if (newStatus != null) {
            app.setStatus(newStatus);
            applicationDao.save(app);

            // If ACCEPTED, create a Job and default Milestone
            if ("ACCEPTED".equals(newStatus)) {
                // Check if job already exists
                if (!jobDao.existsByCampaignAndInfluencer(app.getCampaign(), app.getReceiver())) {
                    fsa.training.entity.Job job = new fsa.training.entity.Job();
                    job.setCampaign(app.getCampaign());
                    job.setInfluencer(app.getReceiver());
                    job.setDescription(app.getCampaign().getDescription());
                    job.setStatus("IN_PROGRESS");
                    job.setCreatedAt(LocalDateTime.now());
                    
                    job = jobDao.save(job);

                    // Create default milestone
                    fsa.training.entity.Milestone milestone = new fsa.training.entity.Milestone();
                    milestone.setJob(job);
                    milestone.setTitle("Final Deliverable");
                    milestone.setDescription("Submit your work evidence here.");
                    milestone.setStatus("PENDING");
                    milestone.setDeadline(app.getCampaign().getDeadline().atStartOfDay()); 
                    
                    milestoneDao.save(milestone);
                }
            }

            return ResponseEntity.ok(app);
        }
        return ResponseEntity.badRequest().body("Status missing");
    }

    @PostMapping("/sync-jobs")
    public ResponseEntity<?> syncJobs() {
        User user = getCurrentUser();
        // Allow Creator or Admin or Receiver (to self-repair)
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        
        List<Application> acceptedApps = applicationDao.findByStatus("ACCEPTED");
        int count = 0;
        for (Application app : acceptedApps) {
            // Check if job already exists
            if (!jobDao.existsByCampaignAndInfluencer(app.getCampaign(), app.getReceiver())) {
                try {
                    fsa.training.entity.Job job = new fsa.training.entity.Job();
                    job.setCampaign(app.getCampaign());
                    job.setInfluencer(app.getReceiver());
                    job.setDescription(app.getCampaign().getDescription());
                    job.setStatus("IN_PROGRESS");
                    job.setCreatedAt(LocalDateTime.now());
                    
                    job = jobDao.save(job);

                    // Create default milestone
                    fsa.training.entity.Milestone milestone = new fsa.training.entity.Milestone();
                    milestone.setJob(job);
                    milestone.setTitle("Final Deliverable");
                    milestone.setDescription("Submit your work evidence here.");
                    milestone.setStatus("PENDING");
                     if (app.getCampaign().getDeadline() != null) {
                        milestone.setDeadline(app.getCampaign().getDeadline().atStartOfDay());
                    } else {
                        milestone.setDeadline(LocalDateTime.now().plusDays(7));
                    }
                    
                    milestoneDao.save(milestone);
                    count++;
                } catch (Exception e) {
                   System.err.println("Failed to sync job for app " + app.getId() + ": " + e.getMessage());
                }
            }
        }
        return ResponseEntity.ok(Map.of("status", "success", "syncedCount", count));
    }
}
