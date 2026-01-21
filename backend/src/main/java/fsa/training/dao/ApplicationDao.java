package fsa.training.dao;

import fsa.training.entity.Application;
import fsa.training.entity.Campaign;
import fsa.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ApplicationDao extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {
    List<Application> findByCampaign(Campaign campaign);
    List<Application> findByReceiver(User receiver);
    List<Application> findByCampaign_Creator(User creator);
    List<Application> findByStatus(String status);
    Optional<Application> findByCampaignAndReceiver(Campaign campaign, User receiver);
}
