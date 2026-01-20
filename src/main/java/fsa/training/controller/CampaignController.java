package fsa.training.controller;

import fsa.training.dao.CampaignDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Campaign;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/campaign")
public class CampaignController {

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private UserDao userDao;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            Object principal = auth.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                // Reload user từ DB để đảm bảo có đầy đủ thông tin
                return userDao.findById(user.getId()).orElse(user);
            }
        }
        return null;
    }

    @GetMapping("/create")
    public String showCreateForm(Model model) {
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            model.addAttribute("currentUser", currentUser);
        }
        
        model.addAttribute("campaign", new Campaign());
        model.addAttribute("isEdit", false);
        return "campaign-create";
    }

    @PostMapping("/create")
    public String createCampaign(@ModelAttribute Campaign campaign,
                                 @RequestParam(required = false) String tagsInput,
                                 @RequestParam(required = false) String platformsInput,
                                 RedirectAttributes redirectAttributes) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                redirectAttributes.addFlashAttribute("error", "Bạn cần đăng nhập để tạo chiến dịch!");
                return "redirect:/login";
            }
            campaign.setCreator(currentUser);

            // Xử lý tags
            if (tagsInput != null && !tagsInput.trim().isEmpty()) {
                List<String> tags = Arrays.stream(tagsInput.split(","))
                        .map(String::trim)
                        .filter(tag -> !tag.isEmpty())
                        .collect(Collectors.toList());
                campaign.setTags(tags);
            }

            // Xử lý platforms
            if (platformsInput != null && !platformsInput.trim().isEmpty()) {
                List<String> platforms = Arrays.stream(platformsInput.split(","))
                        .map(String::trim)
                        .filter(platform -> !platform.isEmpty())
                        .collect(Collectors.toList());
                campaign.setPlatforms(platforms);
            }

            // Set default status nếu chưa có
            if (campaign.getStatus() == null || campaign.getStatus().isEmpty()) {
                campaign.setStatus("Đang tuyển");
            }

            campaignDao.save(campaign);
            redirectAttributes.addFlashAttribute("success", true);
            return "redirect:/creator/my-campaigns?success=true";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Lỗi khi tạo chiến dịch: " + e.getMessage());
            return "redirect:/campaign/create";
        }
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return "redirect:/login";
        }
        model.addAttribute("currentUser", currentUser);
        
        Campaign campaign = campaignDao.findById(id).orElse(null);
        if (campaign == null) {
            redirectAttributes.addFlashAttribute("error", "Không tìm thấy chiến dịch!");
            return "redirect:/creator/my-campaigns";
        }

        // Kiểm tra quyền: chỉ creator hoặc admin mới được sửa
        if (campaign.getCreator() != null && !campaign.getCreator().getId().equals(currentUser.getId()) && 
            (currentUser.getRole() == null || !currentUser.getRole().getName().equals("ADMIN"))) {
            redirectAttributes.addFlashAttribute("error", "Bạn không có quyền sửa chiến dịch này!");
            return "redirect:/creator/my-campaigns";
        }

        model.addAttribute("campaign", campaign);
        model.addAttribute("isEdit", true);
        
        // Convert lists to strings for form
        if (campaign.getTags() != null && !campaign.getTags().isEmpty()) {
            model.addAttribute("tagsInput", String.join(", ", campaign.getTags()));
        }
        if (campaign.getPlatforms() != null && !campaign.getPlatforms().isEmpty()) {
            model.addAttribute("platformsInput", String.join(", ", campaign.getPlatforms()));
        }

        return "campaign-create";
    }

    @PostMapping("/edit/{id}")
    public String updateCampaign(@PathVariable Long id,
                                 @ModelAttribute Campaign campaign,
                                 @RequestParam(required = false) String tagsInput,
                                 @RequestParam(required = false) String platformsInput,
                                 RedirectAttributes redirectAttributes) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return "redirect:/login";
            }
            
            Campaign existingCampaign = campaignDao.findById(id).orElse(null);
            if (existingCampaign == null) {
                redirectAttributes.addFlashAttribute("error", "Không tìm thấy chiến dịch!");
                return "redirect:/creator/my-campaigns";
            }

            // Kiểm tra quyền
            if (existingCampaign.getCreator() != null && !existingCampaign.getCreator().getId().equals(currentUser.getId()) && 
                (currentUser.getRole() == null || !currentUser.getRole().getName().equals("ADMIN"))) {
                redirectAttributes.addFlashAttribute("error", "Bạn không có quyền sửa chiến dịch này!");
                return "redirect:/creator/my-campaigns";
            }

            // Cập nhật thông tin
            existingCampaign.setTitle(campaign.getTitle());
            existingCampaign.setDescription(campaign.getDescription());
            existingCampaign.setImageUrl(campaign.getImageUrl());
            existingCampaign.setDeadline(campaign.getDeadline());
            existingCampaign.setStatus(campaign.getStatus());

            // Xử lý tags
            if (tagsInput != null && !tagsInput.trim().isEmpty()) {
                List<String> tags = Arrays.stream(tagsInput.split(","))
                        .map(String::trim)
                        .filter(tag -> !tag.isEmpty())
                        .collect(Collectors.toList());
                existingCampaign.setTags(tags);
            } else {
                existingCampaign.setTags(java.util.Collections.emptyList());
            }

            // Xử lý platforms
            if (platformsInput != null && !platformsInput.trim().isEmpty()) {
                List<String> platforms = Arrays.stream(platformsInput.split(","))
                        .map(String::trim)
                        .filter(platform -> !platform.isEmpty())
                        .collect(Collectors.toList());
                existingCampaign.setPlatforms(platforms);
            } else {
                existingCampaign.setPlatforms(java.util.Collections.emptyList());
            }

            campaignDao.save(existingCampaign);
            redirectAttributes.addFlashAttribute("updated", true);
            return "redirect:/creator/my-campaigns?updated=true";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Lỗi khi cập nhật chiến dịch: " + e.getMessage());
            return "redirect:/campaign/edit/" + id;
        }
    }
}
