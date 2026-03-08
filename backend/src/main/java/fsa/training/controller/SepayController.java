package fsa.training.controller;

import fsa.training.dto.SepayDto;
import fsa.training.service.SepayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sepay")
public class SepayController {

    @Autowired
    private SepayService sepayService;

    @org.springframework.beans.factory.annotation.Value("${sepay.api-secret}")
    private String apiSecret;

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody SepayDto sepayDto) {

        // Validate Authorization header
        // Sepay sends "Apikey <YOUR_SECRET>"
        if (authorization == null || !authorization.equals("Apikey " + apiSecret)) {
            // For testing/compatibility, we might log a warning but proceed if dev mode,
            // but strictly we should block.
            // However, to avoid breaking the user's manual curl test if they don't include
            // it,
            // let's just log it for now or return 401.
            // Given the user provided the secret, they expect security.
            return ResponseEntity.status(401).body(new SimpleResponse(false, "Unauthorized: Invalid API Key"));
        }

        try {
            sepayService.processWebhook(sepayDto);
            return ResponseEntity.ok().body(new SimpleResponse(true, "Webhook processed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new SimpleResponse(false, e.getMessage()));
        }
    }

    private static class SimpleResponse {
        public boolean success;
        public String message;

        public SimpleResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }
}
