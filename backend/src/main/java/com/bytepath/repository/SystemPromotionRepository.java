package com.bytepath.repository;

import com.bytepath.model.SystemPromotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemPromotionRepository extends JpaRepository<SystemPromotion, Long> {
    Optional<SystemPromotion> findFirstByOrderByIdAsc();
}
