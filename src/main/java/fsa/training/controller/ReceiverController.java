package fsa.training.controller;

import fsa.training.dao.CampaignApplicationDao;
import fsa.training.dao.CampaignDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Campaign;
import fsa.training.entity.CampaignApplication;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class ReceiverController {

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private CampaignApplicationDao campaignApplicationDao;

    @GetMapping("/receiver/dashboard")
    public String dashboard(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            // Reload user từ DB để đảm bảo có đầy đủ thông tin
            User currentUser = userDao.findById(user.getId()).orElse(user);
            model.addAttribute("currentUser", currentUser);
            
            // Lấy tất cả campaigns đang tuyển
            List<Campaign> campaigns = campaignDao.findByStatus("Đang tuyển");
            model.addAttribute("campaigns", campaigns);
            model.addAttribute("campaignCount", campaigns.size());
        }
        return "receiver-dashboard";
    }

    @GetMapping("/receiver/campaign-list")
    public String campaignList(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            // Reload user từ DB để đảm bảo có đầy đủ thông tin
            User currentUser = userDao.findById(user.getId()).orElse(user);
            model.addAttribute("currentUser", currentUser);
            
            // Lấy tất cả campaigns
            List<Campaign> campaigns = campaignDao.findAll();
            model.addAttribute("campaigns", campaigns);
            
            // Lấy tất cả applications của user hiện tại
            List<CampaignApplication> applications = campaignApplicationDao.findByReceiver(currentUser);
            
            // Tạo Map để map campaign ID với application status
            Map<Long, CampaignApplication> applicationMap = applications.stream()
                    .collect(Collectors.toMap(
                            app -> app.getCampaign().getId(),
                            app -> app,
                            (existing, replacement) -> existing // Nếu có duplicate, giữ cái đầu tiên
                    ));
            
            model.addAttribute("applicationMap", applicationMap);
        } else {
            // Nếu chưa đăng nhập, vẫn hiển thị danh sách nhưng không có application info
            List<Campaign> campaigns = campaignDao.findAll();
            model.addAttribute("campaigns", campaigns);
            model.addAttribute("applicationMap", new HashMap<Long, CampaignApplication>());
        }
        
        model.addAttribute("isMyCampaigns", false);
        return "campaign-list";
    }

    @GetMapping("/receiver/campaign-detail/{id}")
    public String campaignDetail(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            // Reload user từ DB để đảm bảo có đầy đủ thông tin
            User currentUser = userDao.findById(user.getId()).orElse(user);
            model.addAttribute("currentUser", currentUser);
            
            Campaign campaign = campaignDao.findById(id).orElse(null);
            if (campaign == null) {
                redirectAttributes.addFlashAttribute("error", "Không tìm thấy chiến dịch!");
                return "redirect:/receiver/campaign-list";
            }
            
            // Kiểm tra xem user đã ứng tuyển chưa
            boolean hasApplied = campaignApplicationDao.existsByCampaignAndReceiver(campaign, currentUser);
            model.addAttribute("hasApplied", hasApplied);
            model.addAttribute("campaign", campaign);
        } else {
            redirectAttributes.addFlashAttribute("error", "Bạn cần đăng nhập để xem chi tiết chiến dịch!");
            return "redirect:/login";
        }
        
        return "receiver-campaign-detail";
    }

    @PostMapping("/apply-campaign")
    public String applyCampaign(@RequestParam Long campaignId,
                               @RequestParam(required = false) String message,
                               RedirectAttributes redirectAttributes) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            redirectAttributes.addFlashAttribute("error", "Bạn cần đăng nhập để ứng tuyển!");
            return "redirect:/login";
        }
        
        User user = (User) auth.getPrincipal();
        // Reload user từ DB để đảm bảo có đầy đủ thông tin
        User currentUser = userDao.findById(user.getId()).orElse(user);
        
        Campaign campaign = campaignDao.findById(campaignId).orElse(null);
        if (campaign == null) {
            redirectAttributes.addFlashAttribute("error", "Không tìm thấy chiến dịch!");
            return "redirect:/receiver/campaign-list";
        }
        
        // Kiểm tra xem user đã ứng tuyển chưa
        if (campaignApplicationDao.existsByCampaignAndReceiver(campaign, currentUser)) {
            redirectAttributes.addFlashAttribute("error", "Bạn đã ứng tuyển chiến dịch này rồi!");
            return "redirect:/receiver/campaign-detail/" + campaignId;
        }
        
        // Kiểm tra xem chiến dịch còn đang tuyển không
        if (!"Đang tuyển".equals(campaign.getStatus())) {
            redirectAttributes.addFlashAttribute("error", "Chiến dịch này không còn nhận ứng tuyển!");
            return "redirect:/receiver/campaign-detail/" + campaignId;
        }
        
        // Kiểm tra deadline
        if (campaign.getDeadline() != null && campaign.getDeadline().isBefore(java.time.LocalDate.now())) {
            redirectAttributes.addFlashAttribute("error", "Chiến dịch này đã hết hạn ứng tuyển!");
            return "redirect:/receiver/campaign-detail/" + campaignId;
        }
        
        // Tạo application mới
        CampaignApplication application = new CampaignApplication();
        application.setCampaign(campaign);
        application.setReceiver(currentUser);
        application.setMessage(message != null && !message.trim().isEmpty() ? message.trim() : "Không có thông điệp");
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus("PENDING");
        
        try {
            campaignApplicationDao.save(application);
            redirectAttributes.addFlashAttribute("success", "Ứng tuyển thành công! Trạng thái: Chờ xác nhận.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Lỗi khi ứng tuyển: " + e.getMessage());
        }
        
        return "redirect:/receiver/campaign-list";
    }

    @PostMapping("/cancel-application")
    public String cancelApplication(@RequestParam Long campaignId,
                                  RedirectAttributes redirectAttributes) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            redirectAttributes.addFlashAttribute("error", "Bạn cần đăng nhập để hủy ứng tuyển!");
            return "redirect:/login";
        }
        
        User user = (User) auth.getPrincipal();
        // Reload user từ DB để đảm bảo có đầy đủ thông tin
        User currentUser = userDao.findById(user.getId()).orElse(user);
        
        Campaign campaign = campaignDao.findById(campaignId).orElse(null);
        if (campaign == null) {
            redirectAttributes.addFlashAttribute("error", "Không tìm thấy chiến dịch!");
            return "redirect:/receiver/campaign-list";
        }
        
        // Tìm application của user cho campaign này
        CampaignApplication application = campaignApplicationDao.findByCampaign(campaign).stream()
                .filter(app -> app.getReceiver().getId().equals(currentUser.getId()))
                .findFirst()
                .orElse(null);
        
        if (application == null) {
            redirectAttributes.addFlashAttribute("error", "Bạn chưa ứng tuyển chiến dịch này!");
            return "redirect:/receiver/campaign-list";
        }
        
        // Chỉ cho phép hủy nếu status là PENDING
        if (!"PENDING".equals(application.getStatus())) {
            redirectAttributes.addFlashAttribute("error", "Không thể hủy ứng tuyển đã được xử lý!");
            return "redirect:/receiver/campaign-list";
        }
        
        try {
            campaignApplicationDao.delete(application);
            redirectAttributes.addFlashAttribute("success", "Hủy ứng tuyển thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Lỗi khi hủy ứng tuyển: " + e.getMessage());
        }
        
        return "redirect:/receiver/campaign-list";
    }
}
