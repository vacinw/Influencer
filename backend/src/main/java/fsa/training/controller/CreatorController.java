package fsa.training.controller;

import fsa.training.dao.CampaignApplicationDao;
import fsa.training.dao.CampaignDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Campaign;
import fsa.training.entity.CampaignApplication;
import fsa.training.entity.CampaignApplication;
import fsa.training.entity.Job;
import fsa.training.entity.Milestone;
import fsa.training.entity.User;
import fsa.training.dao.JobDao;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/creator")
public class CreatorController {

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private CampaignApplicationDao campaignApplicationDao;

    @Autowired
    private JobDao jobDao;

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

        // Return dashboard stats
        List<Campaign> campaigns = campaignDao.findByCreator(currentUser);
        Map<String, Object> response = new HashMap<>();
        response.put("currentUser", currentUser);
        response.put("campaignCount", campaigns.size());
        response.put("recentCampaigns", campaigns.stream().limit(5).toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-campaigns")
    public ResponseEntity<?> myCampaigns() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        List<Campaign> campaigns = campaignDao.findByCreator(currentUser);
        Map<Long, Integer> applicantCountMap = new HashMap<>();
        for (Campaign campaign : campaigns) {
            int count = campaignApplicationDao.findByCampaign(campaign).size();
            applicantCountMap.put(campaign.getId(), count);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("campaigns", campaigns);
        response.put("applicantCountMap", applicantCountMap);

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

        // Check permission
        if (campaign.getCreator() != null && !campaign.getCreator().getId().equals(currentUser.getId()) &&
                (currentUser.getRole() == null || !currentUser.getRole().getName().equals("ADMIN"))) {
            return ResponseEntity.status(403).body("Bạn không có quyền xem chiến dịch này!");
        }

        List<CampaignApplication> applications = campaignApplicationDao.findByCampaign(campaign);
        Map<String, Object> response = new HashMap<>();
        response.put("campaign", campaign);
        response.put("applications", applications);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/application/{applicationId}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable Long applicationId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<CampaignApplication> applicationOpt = campaignApplicationDao.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CampaignApplication application = applicationOpt.get();
        Campaign campaign = application.getCampaign();

        if (campaign.getCreator() == null || !campaign.getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Bạn không có quyền phê duyệt!");
        }

        application.setStatus("APPROVED");
        campaignApplicationDao.save(application);

        // Create Job
        Job job = new Job();
        job.setCampaign(campaign);
        job.setInfluencer(application.getReceiver());
        job.setCreatedAt(LocalDateTime.now());
        job.setStatus("IN_PROGRESS");
        job.setDescription("Hợp đồng hợp tác cho chiến dịch: " + campaign.getTitle());

        // Default Milestones
        Milestone m1 = new Milestone();
        m1.setJob(job);
        m1.setTitle("Lên kế hoạch nội dung");
        m1.setDescription("Gửi kịch bản hoặc kế hoạch chi tiết.");
        m1.setDeadline(LocalDateTime.now().plusDays(3));
        m1.setStatus("PENDING");

        Milestone m2 = new Milestone();
        m2.setJob(job);
        m2.setTitle("Bản nháp (Draft)");
        m2.setDescription("Gửi video/bài viết nháp để duyệt.");
        m2.setDeadline(LocalDateTime.now().plusDays(7));
        m2.setStatus("PENDING");

        Milestone m3 = new Milestone();
        m3.setJob(job);
        m3.setTitle("Đăng bài hoàn thiện");
        m3.setDescription("Đăng bài lên mạng xã hội và gửi link báo cáo.");
        m3.setDeadline(LocalDateTime.now().plusDays(10));
        m3.setStatus("PENDING");

        job.getMilestones().add(m1);
        job.getMilestones().add(m2);
        job.getMilestones().add(m3);

        jobDao.save(job);

        return ResponseEntity.ok("Đã phê duyệt ứng viên thành công!");
    }

    @PostMapping("/application/{applicationId}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long applicationId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<CampaignApplication> applicationOpt = campaignApplicationDao.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CampaignApplication application = applicationOpt.get();
        Campaign campaign = application.getCampaign();

        if (campaign.getCreator() == null || !campaign.getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Bạn không có quyền từ chối!");
        }

        application.setStatus("REJECTED");
        campaignApplicationDao.save(application);

        return ResponseEntity.ok("Đã từ chối ứng viên.");
    }
}
