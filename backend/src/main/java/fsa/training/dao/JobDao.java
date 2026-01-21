package fsa.training.dao;

import fsa.training.entity.Campaign;
import fsa.training.entity.Job;
import fsa.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobDao extends JpaRepository<Job, Long> {
    List<Job> findByInfluencer(User influencer);
    List<Job> findByCampaign(Campaign campaign);
    boolean existsByCampaignAndInfluencer(Campaign campaign, User influencer);
    List<Job> findByCampaign_Creator(User creator);
}
