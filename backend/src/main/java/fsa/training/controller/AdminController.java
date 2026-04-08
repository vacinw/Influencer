package fsa.training.controller;

import fsa.training.dao.*;
import fsa.training.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Transactional
public class AdminController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private TransactionDao transactionDao;

    @Autowired
    private WalletDao walletDao;

    @Autowired
    private ApplicationDao applicationDao;

    @Autowired
    private JobDao jobDao;

    @Autowired
    private VerificationDao verificationDao;

    @Autowired
    private CampaignApplicationDao campaignApplicationDao;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private ReviewDao reviewDao;

    @Autowired
    private SupportTicketDao supportTicketDao;

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
        User user = userDao.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        System.out.println("=== DELETE USER DEBUG ===");
        System.out.println("Deleting user: " + user.getEmail() + " (id=" + id + ")");

        try {
            // Delete campaign applications where user is receiver
            List<CampaignApplication> campaignApps = campaignApplicationDao.findByReceiver(user);
            System.out.println("Found " + campaignApps.size() + " campaign applications");
            campaignApplicationDao.deleteAll(campaignApps);

            // Delete notifications for this user
            notificationDao.deleteAll(notificationDao.findByUserOrderByCreatedAtDesc(user));

            // Delete support tickets created by this user
            supportTicketDao.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getId().equals(id))
                .forEach(supportTicketDao::delete);

            // Delete reviews where user is reviewer or reviewee
            reviewDao.findAll().stream()
                .filter(r -> (r.getCreator() != null && r.getCreator().getId().equals(id)) ||
                             (r.getReceiver() != null && r.getReceiver().getId().equals(id)))
                .forEach(reviewDao::delete);

            // If user is a CREATOR, delete their campaigns (cascades to applications, jobs)
            if (user.getRole() != null && "CREATOR".equals(user.getRole().getName())) {
                List<Campaign> campaigns = campaignDao.findByCreator(user);
                System.out.println("Deleting " + campaigns.size() + " campaigns");
                campaignDao.deleteAll(campaigns);
            }

            // Delete applications where user is receiver
            List<Application> applications = applicationDao.findByReceiver(user);
            System.out.println("Deleting " + applications.size() + " applications");
            applicationDao.deleteAll(applications);

            // Delete jobs where user is influencer (milestones and history will cascade)
            List<Job> jobs = jobDao.findByInfluencer(user);
            System.out.println("Deleting " + jobs.size() + " jobs");
            for (Job job : jobs) {
                jobDao.delete(job);
            }

            // Delete verification requests
            List<VerificationRequest> verifications = verificationDao.findByUser(user);
            System.out.println("Deleting " + verifications.size() + " verification requests");
            verificationDao.deleteAll(verifications);

            // Delete transactions related to user's wallet
            walletDao.findByUser(user).ifPresent(wallet -> {
                System.out.println("Deleting wallet and transactions");
                List<Transaction> transactions = transactionDao.findByWalletOrderByCreatedAtDesc(wallet);
                transactionDao.deleteAll(transactions);
                walletDao.delete(wallet);
            });

            // Finally delete user
            System.out.println("Deleting user...");
            userDao.delete(user);
            System.out.println("User deleted successfully");

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error deleting user: " + e.getMessage());
            return ResponseEntity.badRequest().body("Cannot delete user: " + e.getMessage());
        }
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
        long activeCampaigns = campaignDao.findAll().stream()
                .filter(c -> {
                    String status = c.getStatus();
                    if (status == null) return false;
                    return status.equalsIgnoreCase("Active") || 
                           status.equalsIgnoreCase("Đang tuyển") || 
                           status.equalsIgnoreCase("IN_PROGRESS");
                })
                .count();

        double totalRevenue = transactionDao.findAll().stream()
                .filter(tx -> "DEPOSIT".equals(tx.getType()) && "COMPLETED".equals(tx.getStatus()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalCommission = transactionDao.findAll().stream()
                .filter(tx -> tx.getDescription() != null && tx.getDescription().startsWith("Commission from Job") && "COMPLETED".equals(tx.getStatus()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeCampaigns", activeCampaigns);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalCommission", totalCommission);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/charts")
    public ResponseEntity<?> getChartData(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate start;
        LocalDate end;

        try {
            if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
                start = LocalDate.parse(startDate);
                end = LocalDate.parse(endDate);
            } else {
                end = LocalDate.now();
                start = end.minusDays(6); // Default 7 days including today
            }
        } catch (Exception e) {
            end = LocalDate.now();
            start = end.minusDays(6);
        }

        // If start is after end, swap them
        if (start.isAfter(end)) {
            LocalDate temp = start;
            start = end;
            end = temp;
        }

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.plusDays(1).atStartOfDay();

        List<Transaction> transactions = transactionDao.findAll().stream()
                .filter(tx -> tx.getCreatedAt() != null && !tx.getCreatedAt().isBefore(startDateTime) && tx.getCreatedAt().isBefore(endDateTime) && "COMPLETED".equals(tx.getStatus()))
                .collect(Collectors.toList());

        Map<String, Double> revenueMap = transactions.stream()
                .filter(tx -> "DEPOSIT".equals(tx.getType()))
                .collect(Collectors.groupingBy(
                        tx -> tx.getCreatedAt().toLocalDate().toString(),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        Map<String, Double> commissionMap = transactions.stream()
                .filter(tx -> tx.getDescription() != null && tx.getDescription().startsWith("Commission from Job"))
                .collect(Collectors.groupingBy(
                        tx -> tx.getCreatedAt().toLocalDate().toString(),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        List<Map<String, Object>> chartData = new ArrayList<>();
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(start, end);
        
        for (long i = 0; i <= daysBetween; i++) {
            String dateStr = start.plusDays(i).toString();
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", dateStr);
            dayData.put("revenue", revenueMap.getOrDefault(dateStr, 0.0));
            dayData.put("commission", commissionMap.getOrDefault(dateStr, 0.0));
            chartData.add(dayData);
        }

        return ResponseEntity.ok(chartData);
    }

    @GetMapping("/withdrawals")
    public ResponseEntity<?> getPendingWithdrawals() {
        List<Transaction> pendingWithdrawals = transactionDao.findAll().stream()
                .filter(tx -> "WITHDRAWAL".equals(tx.getType()) && "PENDING".equals(tx.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendingWithdrawals);
    }

    @PutMapping("/withdrawals/{id}/approve")
    public ResponseEntity<?> approveWithdrawal(@PathVariable Long id) {
        Transaction tx = transactionDao.findById(id).orElse(null);
        if (tx == null || !"WITHDRAWAL".equals(tx.getType()) || !"PENDING".equals(tx.getStatus())) {
            return ResponseEntity.badRequest().body("Invalid withdrawal request");
        }
        
        tx.setStatus("COMPLETED");
        transactionDao.save(tx);
        return ResponseEntity.ok(tx);
    }

    @PutMapping("/withdrawals/{id}/reject")
    public ResponseEntity<?> rejectWithdrawal(@PathVariable Long id) {
        Transaction tx = transactionDao.findById(id).orElse(null);
        if (tx == null || !"WITHDRAWAL".equals(tx.getType()) || !"PENDING".equals(tx.getStatus())) {
            return ResponseEntity.badRequest().body("Invalid withdrawal request");
        }
        
        tx.setStatus("FAILED");
        transactionDao.save(tx);
        
        // Refund the deducted amount back to user's wallet
        Wallet wallet = tx.getWallet();
        wallet.setBalance(wallet.getBalance() + tx.getAmount());
        walletDao.save(wallet);
        
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/commissions")
    public ResponseEntity<?> getCommissionHistory() {
        List<Transaction> commissionTransactions = transactionDao.findAll().stream()
                .filter(tx -> tx.getDescription() != null && tx.getDescription().startsWith("Commission from Job"))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(commissionTransactions);
    }
}
