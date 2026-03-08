package fsa.training.dto;

import fsa.training.entity.Review;
import java.time.LocalDateTime;

public class ReviewResponse {
    private Long id;
    private Long creatorId;
    private String creatorName;
    private String creatorAvatar;
    private Long campaignId;
    private String campaignTitle;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public String getCreatorAvatar() {
        return creatorAvatar;
    }

    public void setCreatorAvatar(String creatorAvatar) {
        this.creatorAvatar = creatorAvatar;
    }

    public Long getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(Long campaignId) {
        this.campaignId = campaignId;
    }

    public String getCampaignTitle() {
        return campaignTitle;
    }

    public void setCampaignTitle(String campaignTitle) {
        this.campaignTitle = campaignTitle;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static ReviewResponse fromEntity(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setCreatorId(review.getCreator().getId());
        response.setCreatorName(review.getCreator().getName());
        response.setCampaignId(review.getCampaign().getId());
        response.setCampaignTitle(review.getCampaign().getTitle());
        response.setRating(review.getRating());
        response.setContent(review.getContent());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
