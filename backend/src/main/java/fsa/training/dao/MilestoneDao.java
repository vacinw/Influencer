package fsa.training.dao;

import fsa.training.entity.Job;
import fsa.training.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MilestoneDao extends JpaRepository<Milestone, Long> {
    List<Milestone> findByJob(Job job);
}
