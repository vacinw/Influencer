package fsa.training.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.util.Map;
import java.util.List;

@Service
public class AIService {

    @Value("${fpt.ai.api-key:}") // Default to empty if not set
    private String apiKey;

    public static class AIResult {
        public boolean isValid;
        public float confidence;
        public String message;

        public AIResult(boolean isValid, float confidence, String message) {
            this.isValid = isValid;
            this.confidence = confidence;
            this.message = message;
        }
    }

    /**
     * Validates ID Card using FPT.AI Vision API (IDR).
     */
    public AIResult validateIdCard(String documentUrl) {
        System.out.println("Validating ID Card: " + documentUrl);

        // 1. If no API Key is configured, fallback to MOCK mode (for Demo/Dev)
        if (apiKey == null || apiKey.isEmpty() || "YOUR_FPT_API_KEY".equals(apiKey)) {
            System.out.println("No FPT.AI API Key found. Using MOCK mode.");
            if (documentUrl != null && documentUrl.toLowerCase().contains("invalid")) {
                 return new AIResult(false, 0.45f, "Phát hiện dấu hiệu chỉnh sửa (Mock)");
            }
            return new AIResult(true, 0.98f, "Hợp lệ (Mock Verified)");
        }

        // 2. Real API Call to FPT.AI
        try {
            String apiUrl = "https://api.fpt.ai/vision/idr/vnm";
            
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("api_key", apiKey);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image_url", documentUrl);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);
            Map<String, Object> respBody = response.getBody();

            if (respBody != null && Integer.valueOf(0).equals(respBody.get("errorCode"))) {
                List<Map<String, Object>> dataList = (List<Map<String, Object>>) respBody.get("data");
                if (dataList != null && !dataList.isEmpty()) {
                    // Start with high confidence, verify specific fields if needed
                    // For simplicity, if FPT returns data (errorCode=0), we consider it a valid card structure.
                    // You can parse "id", "name" fields to match with User data for stricter check.
                    
                    return new AIResult(true, 0.95f, "Đã xác thực bởi FPT.AI");
                }
            }
            
            return new AIResult(false, 0.0f, "Không nhận diện được CMND/CCCD (FPT Error: " + respBody.get("errorMessage") + ")");

        } catch (Exception e) {
            e.printStackTrace();
            return new AIResult(false, 0.0f, "Lỗi gọi AI Service: " + e.getMessage());
        }
    }
}
