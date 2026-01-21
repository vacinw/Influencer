package fsa.training.controller;

import fsa.training.dao.JobDao;
import fsa.training.dao.MilestoneDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Job;
import fsa.training.entity.Milestone;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/job")
public class JobController {

    @Autowired
    private JobDao jobDao;

    @Autowired
    private MilestoneDao milestoneDao;

    @Autowired
    private fsa.training.dao.MilestoneHistoryDao milestoneHistoryDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private fsa.training.dao.WalletDao walletDao;

    @Autowired
    private fsa.training.dao.TransactionDao transactionDao;

    @Autowired
    private fsa.training.dao.CampaignDao campaignDao;

    @Autowired
    private fsa.training.dao.ApplicationDao applicationDao;

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

    @GetMapping("/{id}")
    public ResponseEntity<?> getJob(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<Job> jobOpt = jobDao.findById(id);
        if (jobOpt.isEmpty()) return ResponseEntity.notFound().build();

        Job job = jobOpt.get();

        // Check permission: Creator, Influencer, or Admin
        boolean isCreator = job.getCampaign().getCreator().getId().equals(currentUser.getId());
        boolean isInfluencer = job.getInfluencer().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() != null && currentUser.getRole().getName().equals("ADMIN");

        if (!isCreator && !isInfluencer && !isAdmin) {
            return ResponseEntity.status(403).body("Access denied");
        }

        return ResponseEntity.ok(job);
    }

    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs() {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body("Unauthorized");

        java.util.List<Job> jobs;
        if (currentUser.getRole().getName().equals("RECEIVER")) {
            jobs = jobDao.findByInfluencer(currentUser);
        } else if (currentUser.getRole().getName().equals("CREATOR")) {
            jobs = jobDao.findByCampaign_Creator(currentUser);
        } else if (currentUser.getRole().getName().equals("ADMIN")) {
            jobs = jobDao.findAll();
        } else {
            jobs = java.util.Collections.emptyList();
        }

        return ResponseEntity.ok(jobs);
    }

    @PostMapping("/{jobId}/milestone")
    public ResponseEntity<?> createMilestone(@PathVariable Long jobId, @RequestBody Map<String, Object> payload) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<Job> jobOpt = jobDao.findById(jobId);
        if (jobOpt.isEmpty()) return ResponseEntity.notFound().build();
        Job job = jobOpt.get();

        // Only Creator can add milestones
        if (!job.getCampaign().getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Only the campaign creator can add milestones");
        }

        String title = (String) payload.get("title");
        String description = (String) payload.get("description");
        String deadlineStr = (String) payload.get("deadline");

        if (title == null || title.isEmpty()) return ResponseEntity.badRequest().body("Title is required");

        Milestone milestone = new Milestone();
        milestone.setJob(job);
        milestone.setTitle(title);
        milestone.setDescription(description);
        milestone.setStatus("PENDING");
        
        if (deadlineStr != null) {
            try {
                milestone.setDeadline(LocalDateTime.parse(deadlineStr)); // ISO format expected
            } catch (Exception e) {
                 // ignore or handle error
            }
        } else {
             milestone.setDeadline(LocalDateTime.now().plusDays(7));
        }

        milestoneDao.save(milestone);
        return ResponseEntity.ok(milestone);
    }
    
    @PostMapping("/{jobId}/complete")
    public ResponseEntity<?> completeJob(@PathVariable Long jobId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<Job> jobOpt = jobDao.findById(jobId);
        if (jobOpt.isEmpty()) return ResponseEntity.notFound().build();
        Job job = jobOpt.get();

        // Only Creator can complete job
        if (!job.getCampaign().getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Only the campaign creator can complete the job");
        }
        
        // 1. Financial Transaction
        User creator = currentUser;
        User influencer = job.getInfluencer();
        Double amount = job.getPrice() != null ? job.getPrice() : 0.0;
        
        if (amount > 0) {
            fsa.training.entity.Wallet creatorWallet = walletDao.findByUser(creator).orElseThrow(() -> new RuntimeException("Creator wallet not found"));
            fsa.training.entity.Wallet influencerWallet = walletDao.findByUser(influencer).orElseThrow(() -> new RuntimeException("Influencer wallet not found"));
            
            if (creatorWallet.getBalance() < amount) {
                return ResponseEntity.badRequest().body("Insufficient funds in wallet");
            }
            
            // Transfer
            creatorWallet.setBalance(creatorWallet.getBalance() - amount);
            influencerWallet.setBalance(influencerWallet.getBalance() + amount);
            
            walletDao.save(creatorWallet);
            walletDao.save(influencerWallet);
            
            // Log Transactions
            fsa.training.entity.Transaction debit = new fsa.training.entity.Transaction();
            debit.setWallet(creatorWallet);
            debit.setAmount(amount);
            debit.setType("PAYMENT");
            debit.setStatus("COMPLETED");
            debit.setDescription("Payment for Job #" + job.getId() + ": " + job.getCampaign().getTitle());
            transactionDao.save(debit);
            
            fsa.training.entity.Transaction credit = new fsa.training.entity.Transaction();
            credit.setWallet(influencerWallet);
            credit.setAmount(amount);
            credit.setType("DEPOSIT");
            credit.setStatus("COMPLETED");
            credit.setDescription("Payment received for Job #" + job.getId());
            transactionDao.save(credit);
        }

        // 2. Update Job Status
        job.setStatus("COMPLETED");
        job.setCompletedAt(LocalDateTime.now());
        jobDao.save(job);
        
        // 3. Close Campaign
        fsa.training.entity.Campaign campaign = job.getCampaign();
        campaign.setStatus("COMPLETED"); 
        campaignDao.save(campaign);

        // 4. Update Application Status to COMPLETED
        // Find the application corresponding to this job (same campaign and influencer)
        java.util.List<fsa.training.entity.Application> apps = applicationDao.findByReceiver(job.getInfluencer());
        // Simple filter (better if we had findByCampaignAndReceiver)
        for(fsa.training.entity.Application app : apps) {
            if(app.getCampaign().getId().equals(campaign.getId())) {
                app.setStatus("COMPLETED");
                applicationDao.save(app);
                break;
            }
        }
        
        return ResponseEntity.ok(job);
    }

    @PostMapping("/{jobId}/milestone/{milestoneId}/submit")
    public ResponseEntity<?> submitMilestone(@PathVariable Long jobId, @PathVariable Long milestoneId, @RequestBody Map<String, String> payload) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<Milestone> milestoneOpt = milestoneDao.findById(milestoneId);
        if (milestoneOpt.isEmpty()) return ResponseEntity.notFound().build();

        Milestone milestone = milestoneOpt.get();
        if (!milestone.getJob().getId().equals(jobId)) return ResponseEntity.badRequest().body("Milestone does not belong to this Job");

        // Only Influencer can submit
        if (!milestone.getJob().getInfluencer().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Only the assigned influencer can submit evidence");
        }

        String evidenceUrl = payload.get("evidenceUrl");
        String description = payload.get("description");
        
        if (evidenceUrl == null || evidenceUrl.isEmpty()) return ResponseEntity.badRequest().body("Evidence URL is required");

        milestone.setEvidenceUrl(evidenceUrl);
        milestone.setSubmissionDescription(description);
        milestone.setStatus("SUBMITTED");
        milestoneDao.save(milestone);

        // Record History
        fsa.training.entity.MilestoneHistory history = new fsa.training.entity.MilestoneHistory();
        history.setMilestone(milestone);
        history.setAction("SUBMITTED");
        history.setDescription(description);
        history.setEvidenceUrl(evidenceUrl);
        milestoneHistoryDao.save(history);

        return ResponseEntity.ok(milestone);
    }

    @PostMapping("/{jobId}/milestone/{milestoneId}/review")
    public ResponseEntity<?> reviewMilestone(@PathVariable Long jobId, @PathVariable Long milestoneId, @RequestBody Map<String, String> payload) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<Milestone> milestoneOpt = milestoneDao.findById(milestoneId);
        if (milestoneOpt.isEmpty()) return ResponseEntity.notFound().build();

        Milestone milestone = milestoneOpt.get();
        if (!milestone.getJob().getId().equals(jobId)) return ResponseEntity.badRequest().body("Milestone does not belong to this Job");

        // Only Creator can review
        if (!milestone.getJob().getCampaign().getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Only the campaign creator can review milestones");
        }

        String status = payload.get("status"); // APPROVED or REJECTED
        String feedback = payload.get("feedback");

        if (!"APPROVED".equals(status) && !"REJECTED".equals(status)) {
            return ResponseEntity.badRequest().body("Invalid status. Must be APPROVED or REJECTED");
        }

        milestone.setStatus(status);
        milestone.setCreatorFeedback(feedback);
        milestoneDao.save(milestone);
        
        // Record History
        fsa.training.entity.MilestoneHistory history = new fsa.training.entity.MilestoneHistory();
        history.setMilestone(milestone);
        history.setAction(status); // APPROVED or REJECTED
        history.setDescription(feedback);
        milestoneHistoryDao.save(history);

        return ResponseEntity.ok(milestone);
    }
}
