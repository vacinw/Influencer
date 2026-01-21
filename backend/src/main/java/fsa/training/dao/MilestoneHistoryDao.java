package fsa.training.dao;

import fsa.training.entity.MilestoneHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneHistoryDao extends JpaRepository<MilestoneHistory, Long> {
    List<MilestoneHistory> findByMilestone_IdOrderByCreatedAtDesc(Long milestoneId);
}
