package fsa.training.controller;

import fsa.training.dao.CampaignApplicationDao;
import fsa.training.dao.CampaignDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Campaign;
import fsa.training.entity.CampaignApplication;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receiver")
public class ReceiverController {

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private CampaignApplicationDao campaignApplicationDao;

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

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        // Return campaigns suitable for receiver (e.g., active ones)
        List<Campaign> campaigns = campaignDao.findByStatus("Đang tuyển");
        Map<String, Object> response = new HashMap<>();
        response.put("currentUser", currentUser);
        response.put("campaigns", campaigns);
        response.put("campaignCount", campaigns.size());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/campaign-list")
    public ResponseEntity<?> campaignList() {
        User currentUser = getCurrentUser();
        // Allows viewing list without login? Logic said "if auth else".
        // REST API: stick to auth preferred, or public list.
        // Let's allow public access to list but restrict application info.

        List<Campaign> campaigns = campaignDao.findAll();
        Map<Long, CampaignApplication> applicationMap = new HashMap<>();

        if (currentUser != null) {
            List<CampaignApplication> applications = campaignApplicationDao.findByReceiver(currentUser);
            applicationMap = applications.stream()
                    .collect(Collectors.toMap(
                            app -> app.getCampaign().getId(),
                            app -> app,
                            (existing, replacement) -> existing));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("campaigns", campaigns);
        response.put("applicationMap", applicationMap);
        response.put("currentUser", currentUser);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/campaign-detail/{id}")
    public ResponseEntity<?> campaignDetail(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập!");
        }

        Campaign campaign = campaignDao.findById(id).orElse(null);
        if (campaign == null) {
            return ResponseEntity.notFound().build();
        }

        boolean hasApplied = campaignApplicationDao.existsByCampaignAndReceiver(campaign, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("campaign", campaign);
        response.put("hasApplied", hasApplied);
        response.put("currentUser", currentUser);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/apply-campaign")
    public ResponseEntity<?> applyCampaign(@RequestParam Long campaignId,
            @RequestParam(required = false) String message) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để ứng tuyển!");
        }

        Campaign campaign = campaignDao.findById(campaignId).orElse(null);
        if (campaign == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy chiến dịch!");
        }

        if (campaignApplicationDao.existsByCampaignAndReceiver(campaign, currentUser)) {
            return ResponseEntity.badRequest().body("Bạn đã ứng tuyển chiến dịch này rồi!");
        }

        if (!"Đang tuyển".equals(campaign.getStatus())) {
            return ResponseEntity.badRequest().body("Chiến dịch này không còn nhận ứng tuyển!");
        }

        if (campaign.getDeadline() != null && campaign.getDeadline().isBefore(java.time.LocalDate.now())) {
            return ResponseEntity.badRequest().body("Chiến dịch này đã hết hạn ứng tuyển!");
        }

        CampaignApplication application = new CampaignApplication();
        application.setCampaign(campaign);
        application.setReceiver(currentUser);
        application.setMessage(message != null && !message.trim().isEmpty() ? message.trim() : "Không có thông điệp");
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus("PENDING");

        try {
            campaignApplicationDao.save(application);
            return ResponseEntity.ok("Ứng tuyển thành công! Trạng thái: Chờ xác nhận.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi ứng tuyển: " + e.getMessage());
        }
    }

    @PostMapping("/cancel-application")
    public ResponseEntity<?> cancelApplication(@RequestParam Long campaignId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập!");
        }

        Campaign campaign = campaignDao.findById(campaignId).orElse(null);
        if (campaign == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy chiến dịch!");
        }

        CampaignApplication application = campaignApplicationDao.findByCampaign(campaign).stream()
                .filter(app -> app.getReceiver().getId().equals(currentUser.getId()))
                .findFirst()
                .orElse(null);

        if (application == null) {
            return ResponseEntity.badRequest().body("Bạn chưa ứng tuyển chiến dịch này!");
        }

        if (!"PENDING".equals(application.getStatus())) {
            return ResponseEntity.badRequest().body("Không thể hủy ứng tuyển đã được xử lý!");
        }

        try {
            campaignApplicationDao.delete(application);
            return ResponseEntity.ok("Hủy ứng tuyển thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi hủy ứng tuyển: " + e.getMessage());
        }
    }
}
