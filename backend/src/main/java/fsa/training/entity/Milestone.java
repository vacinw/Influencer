package fsa.training.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "milestones")
public class Milestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Job job;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime deadline;

    private String status; // PENDING, SUBMITTED, APPROVED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String evidenceUrl; // Link to draft/video/image

    @Column(columnDefinition = "TEXT")
    private String creatorFeedback; // Feedback if rejected

    @Column(columnDefinition = "TEXT")
    private String submissionDescription; // Context from influencer

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEvidenceUrl() { return evidenceUrl; }
    public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }

    public String getCreatorFeedback() { return creatorFeedback; }
    public void setCreatorFeedback(String creatorFeedback) { this.creatorFeedback = creatorFeedback; }

    public String getSubmissionDescription() { return submissionDescription; }
    public void setSubmissionDescription(String submissionDescription) { this.submissionDescription = submissionDescription; }

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    private java.util.List<MilestoneHistory> history;

    public java.util.List<MilestoneHistory> getHistory() { return history; }
    public void setHistory(java.util.List<MilestoneHistory> history) { this.history = history; }
}
