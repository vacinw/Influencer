package fsa.training.dao;

import fsa.training.entity.Campaign;
import fsa.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.cache.annotation.Cacheable;

import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface CampaignDao extends JpaRepository<Campaign, Long>, JpaSpecificationExecutor<Campaign> {
    @Cacheable("campaignsByCreator")
    List<Campaign> findByCreator(User creator);
    @Cacheable("campaignsByStatus")
    List<Campaign> findByStatus(String status);
}
