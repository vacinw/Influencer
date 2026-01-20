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
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class CreatorController {

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private CampaignApplicationDao campaignApplicationDao;

    @GetMapping("/creator/dashboard")
    public String dashboard(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            // Reload user từ DB để đảm bảo có đầy đủ thông tin
            User currentUser = userDao.findById(user.getId()).orElse(user);
            model.addAttribute("currentUser", currentUser);
            
            // Lấy danh sách campaigns của creator
            List<Campaign> campaigns = campaignDao.findByCreator(currentUser);
            model.addAttribute("campaigns", campaigns);
            model.addAttribute("campaignCount", campaigns.size());
        }
        return "creator-dashboard";
    }

    @GetMapping("/creator/my-campaigns")
    public String myCampaigns(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            // Reload user từ DB để đảm bảo có đầy đủ thông tin
            User currentUser = userDao.findById(user.getId()).orElse(user);
            model.addAttribute("currentUser", currentUser);
            
            // Lấy danh sách campaigns của creator
            List<Campaign> campaigns = campaignDao.findByCreator(currentUser);
            model.addAttribute("campaigns", campaigns);
            
            // Đếm số lượng ứng viên cho mỗi campaign
            Map<Long, Integer> applicantCountMap = new HashMap<>();
            for (Campaign campaign : campaigns) {
                int count = campaignApplicationDao.findByCampaign(campaign).size();
                applicantCountMap.put(campaign.getId(), count);
            }
            model.addAttribute("applicantCountMap", applicantCountMap);
        } else {
            model.addAttribute("applicantCountMap", new HashMap<Long, Integer>());
        }
        model.addAttribute("isMyCampaigns", true);
        return "campaign-list";
    }

    @GetMapping("/creator/campaign-detail/{id}")
    public String campaignDetail(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            redirectAttributes.addFlashAttribute("error", "Bạn cần đăng nhập để xem chi tiết chiến dịch!");
            return "redirect:/login";
        }
        
        User user = (User) auth.getPrincipal();
        // Reload user từ DB để đảm bảo có đầy đủ thông tin
        User currentUser = userDao.findById(user.getId()).orElse(user);
        model.addAttribute("currentUser", currentUser);
        
        Campaign campaign = campaignDao.findById(id).orElse(null);
        if (campaign == null) {
            redirectAttributes.addFlashAttribute("error", "Không tìm thấy chiến dịch!");
            return "redirect:/creator/my-campaigns";
        }
        
        // Kiểm tra quyền: chỉ creator hoặc admin mới được xem
        if (campaign.getCreator() != null && !campaign.getCreator().getId().equals(currentUser.getId()) && 
            (currentUser.getRole() == null || !currentUser.getRole().getName().equals("ADMIN"))) {
            redirectAttributes.addFlashAttribute("error", "Bạn không có quyền xem chiến dịch này!");
            return "redirect:/creator/my-campaigns";
        }
        
        // Lấy danh sách applications cho campaign này
        List<CampaignApplication> applications = campaignApplicationDao.findByCampaign(campaign);
        model.addAttribute("applications", applications);
        model.addAttribute("campaign", campaign);
        return "creator-campaign-detail";
    }

    @PostMapping("/creator/application/{applicationId}/approve")
    public String approveApplication(@PathVariable Long applicationId, RedirectAttributes redirectAttributes) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            redirectAttributes.addFlashAttribute("error", "Bạn cần đăng nhập!");
            return "redirect:/login";
        }

        User user = (User) auth.getPrincipal();
        User currentUser = userDao.findById(user.getId()).orElse(user);

        Optional<CampaignApplication> applicationOpt = campaignApplicationDao.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Không tìm thấy đơn ứng tuyển!");
            return "redirect:/creator/my-campaigns";
        }

        CampaignApplication application = applicationOpt.get();
        Campaign campaign = application.getCampaign();

        // Kiểm tra quyền: chỉ creator của campaign mới được phê duyệt
        if (campaign.getCreator() == null || !campaign.getCreator().getId().equals(currentUser.getId())) {
            redirectAttributes.addFlashAttribute("error", "Bạn không có quyền phê duyệt đơn ứng tuyển này!");
            return "redirect:/creator/my-campaigns";
        }

        // Cho phép phê duyệt bất kỳ lúc nào (có thể thay đổi từ REJECTED về APPROVED)
        String oldStatus = application.getStatus();
        application.setStatus("APPROVED");
        campaignApplicationDao.save(application);

        String receiverName = application.getReceiver() != null ? application.getReceiver().getName() : "";
        if ("REJECTED".equals(oldStatus)) {
            redirectAttributes.addFlashAttribute("success", "Đã thay đổi trạng thái của ứng viên " + receiverName + " từ 'Từ chối' sang 'Phê duyệt'!");
        } else {
            redirectAttributes.addFlashAttribute("success", "Đã phê duyệt ứng viên " + receiverName + " thành công!");
        }
        return "redirect:/creator/campaign-detail/" + campaign.getId();
    }

    @PostMapping("/creator/application/{applicationId}/reject")
    public String rejectApplication(@PathVariable Long applicationId, RedirectAttributes redirectAttributes) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            redirectAttributes.addFlashAttribute("error", "Bạn cần đăng nhập!");
            return "redirect:/login";
        }

        User user = (User) auth.getPrincipal();
        User currentUser = userDao.findById(user.getId()).orElse(user);

        Optional<CampaignApplication> applicationOpt = campaignApplicationDao.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Không tìm thấy đơn ứng tuyển!");
            return "redirect:/creator/my-campaigns";
        }

        CampaignApplication application = applicationOpt.get();
        Campaign campaign = application.getCampaign();

        // Kiểm tra quyền: chỉ creator của campaign mới được từ chối
        if (campaign.getCreator() == null || !campaign.getCreator().getId().equals(currentUser.getId())) {
            redirectAttributes.addFlashAttribute("error", "Bạn không có quyền từ chối đơn ứng tuyển này!");
            return "redirect:/creator/my-campaigns";
        }

        // Cho phép từ chối bất kỳ lúc nào (có thể thay đổi từ APPROVED về REJECTED)
        String oldStatus = application.getStatus();
        application.setStatus("REJECTED");
        campaignApplicationDao.save(application);

        String receiverName = application.getReceiver() != null ? application.getReceiver().getName() : "";
        if ("APPROVED".equals(oldStatus)) {
            redirectAttributes.addFlashAttribute("success", "Đã thay đổi trạng thái của ứng viên " + receiverName + " từ 'Phê duyệt' sang 'Từ chối'!");
        } else {
            redirectAttributes.addFlashAttribute("success", "Đã từ chối ứng viên " + receiverName + ".");
        }
        return "redirect:/creator/campaign-detail/" + campaign.getId();
    }
}
