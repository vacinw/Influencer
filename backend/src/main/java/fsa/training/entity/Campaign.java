package fsa.training.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campaigns", indexes = {
    @Index(name = "idx_campaign_creator", columnList = "creator_id"),
    @Index(name = "idx_campaign_status", columnList = "status")
})
public class Campaign {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ElementCollection
    @CollectionTable(name = "campaign_images", 
                     joinColumns = @JoinColumn(name = "campaign_id", nullable = false))
    @Column(name = "image_url")
    @org.hibernate.annotations.BatchSize(size = 20)
    private List<String> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "campaign_videos", 
                     joinColumns = @JoinColumn(name = "campaign_id", nullable = false))
    @Column(name = "video_url")
    @org.hibernate.annotations.BatchSize(size = 20)
    private List<String> videos = new ArrayList<>();
    
    private LocalDate deadline;
    
    private String status;
    
    @ElementCollection
    @CollectionTable(name = "campaign_tags", 
                     joinColumns = @JoinColumn(name = "campaign_id", nullable = false))
    @Column(name = "tag")
    @org.hibernate.annotations.BatchSize(size = 20)
    private List<String> tags = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "campaign_platforms", 
                     joinColumns = @JoinColumn(name = "campaign_id", nullable = false))
    @Column(name = "platform")
    @org.hibernate.annotations.BatchSize(size = 20)
    private List<String> platforms = new ArrayList<>();
    
    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;
    
    private String layoutStyle; // "CLASSIC", "MODERN", "MINIMAL"

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.REMOVE)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.REMOVE)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Job> jobs = new ArrayList<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.REMOVE)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Review> reviews = new ArrayList<>();

    @org.hibernate.annotations.Formula("(SELECT count(a.id) FROM applications a WHERE a.campaign_id = id)")
    private int applicantCount;

    @org.hibernate.annotations.Formula("(SELECT count(a.id) FROM applications a WHERE a.campaign_id = id AND a.status IN ('ACCEPTED', 'COMPLETED'))")
    private int approvedApplicantCount;

    @Column(columnDefinition = "DOUBLE default 0.0")
    private Double budget = 0.0;

    @Column(columnDefinition = "INT default 1")
    private Integer targetApplicants = 1;

    public int getApplicantCount() {
        return applicantCount;
    }

    public void setApplicantCount(int applicantCount) {
        this.applicantCount = applicantCount;
    }

    public int getApprovedApplicantCount() {
        return approvedApplicantCount;
    }

    public void setApprovedApplicantCount(int approvedApplicantCount) {
        this.approvedApplicantCount = approvedApplicantCount;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public Integer getTargetApplicants() {
        return targetApplicants;
    }

    public void setTargetApplicants(Integer targetApplicants) {
        this.targetApplicants = targetApplicants;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public List<String> getVideos() {
        return videos;
    }

    public void setVideos(List<String> videos) {
        this.videos = videos;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public String getLayoutStyle() {
        return layoutStyle;
    }

    public void setLayoutStyle(String layoutStyle) {
        this.layoutStyle = layoutStyle;
    }
}
