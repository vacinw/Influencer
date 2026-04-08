package fsa.training.controller;

import fsa.training.dao.CampaignDao;
import fsa.training.dao.JobDao;
import fsa.training.dao.ReviewDao;
import fsa.training.dao.UserDao;
import fsa.training.dto.ReviewRequest;
import fsa.training.dto.ReviewResponse;
import fsa.training.entity.Campaign;
import fsa.training.entity.Job;
import fsa.training.entity.Review;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    @Autowired
    private ReviewDao reviewDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private CampaignDao campaignDao;

    @Autowired
    private JobDao jobDao;

    @PostMapping("/create")
    public ResponseEntity<?> createReview(@RequestBody ReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User creator = userDao.findByEmail(email);

        if (creator == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        User receiver = userDao.findById(request.getReceiverId()).orElse(null);
        Campaign campaign = campaignDao.findById(request.getCampaignId()).orElse(null);

        if (receiver == null || campaign == null) {
            return ResponseEntity.badRequest().body("Receiver or Campaign not found");
        }

        boolean isBrandReviewingKOL = campaign.getCreator().getId().equals(creator.getId()) && jobDao.existsByCampaignAndInfluencer(campaign, receiver);
        boolean isKOLReviewingBrand = campaign.getCreator().getId().equals(receiver.getId()) && jobDao.existsByCampaignAndInfluencer(campaign, creator);

        if (!isBrandReviewingKOL && !isKOLReviewingBrand) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You do not have permission to write a review for this user on this campaign");
        }

        // Check if a review already exists
        if (reviewDao.existsByCreatorIdAndReceiverIdAndCampaignId(creator.getId(), receiver.getId(),
                campaign.getId())) {
            return ResponseEntity.badRequest().body("You have already reviewed this receiver for this campaign.");
        }

        Review review = new Review();
        review.setCreator(creator);
        review.setReceiver(receiver);
        review.setCampaign(campaign);
        review.setRating(request.getRating());
        review.setContent(request.getContent());

        reviewDao.save(review);

        return ResponseEntity.ok(ReviewResponse.fromEntity(review));
    }

    @GetMapping("/receiver/{receiverId}")
    public ResponseEntity<?> getReceiverReviews(@PathVariable Long receiverId) {
        List<Review> reviews = reviewDao.findByReceiverIdOrderByCreatedAtDesc(receiverId);
        Double averageRating = reviewDao.getAverageRatingForReceiver(receiverId);

        List<ReviewResponse> reviewResponses = reviews.stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("averageRating", averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0);
        response.put("totalReviews", reviews.size());
        response.put("reviews", reviewResponses);

        return ResponseEntity.ok(response);
    }
}
