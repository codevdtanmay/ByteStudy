package com.bytepath.repository;

import com.bytepath.model.HnbguAchiever;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HnbguAchieverRepository extends JpaRepository<HnbguAchiever, Long> {
    List<HnbguAchiever> findAllByOrderByCreatedAtDesc();
}
