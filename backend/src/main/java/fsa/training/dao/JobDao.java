package fsa.training.dao;

import fsa.training.entity.Campaign;
import fsa.training.entity.Job;
import fsa.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.cache.annotation.Cacheable;
import java.util.List;

public interface JobDao extends JpaRepository<Job, Long> {
    @Cacheable("jobsByInfluencer")
    List<Job> findByInfluencer(User influencer);
    @Cacheable("jobsByCampaign")
    List<Job> findByCampaign(Campaign campaign);
    boolean existsByCampaignAndInfluencer(Campaign campaign, User influencer);
    @Cacheable("jobsByCreator")
    List<Job> findByCampaign_Creator(User creator);
}
