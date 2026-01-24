package fsa.training.controller;

import fsa.training.dao.UserDao;
import fsa.training.dao.VerificationDao;
import fsa.training.entity.User;
import fsa.training.entity.VerificationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    @Autowired
    private VerificationDao verificationDao;

    @Autowired
    private UserDao userDao;
    
    @Autowired
    private fsa.training.service.AIService aiService;

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

    @PostMapping("/request")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, String> payload) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        // Check if pending exists
        if (verificationDao.findByUserAndStatus(user, "PENDING").isPresent()) {
            return ResponseEntity.badRequest().body("You already have a pending verification request.");
        }

        VerificationRequest req = new VerificationRequest();
        req.setUser(user);
        req.setDocumentType(payload.get("documentType"));
        req.setDocumentUrl(payload.get("documentUrl"));
        
        // AI AUTO-VERIFICATION LOGIC
        // Only apply for ID_CARD (CCCD) as Business License AI is harder to verify
        if ("ID_CARD".equals(payload.get("documentType"))) {
            fsa.training.service.AIService.AIResult aiResult = aiService.validateIdCard(payload.get("documentUrl"));
            
            if (aiResult.isValid && aiResult.confidence > 0.9) {
                // Auto Approve
                req.setStatus("APPROVED");
                req.setAdminNote("AUTO-APPROVED BY AI SYSTEM. Confidence: " + (aiResult.confidence * 100) + "%");
                
                // Update User immediately
                user.setVerified(true);
                userDao.save(user);
            } else {
                // Flag for manual review
                req.setStatus("PENDING");
                req.setAdminNote("AI Analysis: " + aiResult.message + " (" + (aiResult.confidence * 100) + "%)");
            }
        } else {
             req.setStatus("PENDING");
        }
        
        verificationDao.save(req);
        return ResponseEntity.ok(req);
    }
    
    @GetMapping("/my-status")
    public ResponseEntity<?> getMyStatus() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        
        List<VerificationRequest> requests = verificationDao.findByUser(user);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests() {
        User user = getCurrentUser();
        if (user == null || !user.getRole().getName().equals("ADMIN")) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        return ResponseEntity.ok(verificationDao.findByStatus("PENDING"));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        User admin = getCurrentUser();
        if (admin == null || !admin.getRole().getName().equals("ADMIN")) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        VerificationRequest req = verificationDao.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();

        req.setStatus("APPROVED");
        verificationDao.save(req);

        // Update User
        User user = req.getUser();
        user.setVerified(true);
        userDao.save(user);

        return ResponseEntity.ok("Approved");
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User admin = getCurrentUser();
        if (admin == null || !admin.getRole().getName().equals("ADMIN")) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        VerificationRequest req = verificationDao.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();

        req.setStatus("REJECTED");
        req.setAdminNote(payload.get("note"));
        verificationDao.save(req);

        return ResponseEntity.ok("Rejected");
    }
    
}
