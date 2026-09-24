package com.bytepath.repository;

import com.bytepath.model.StudentVideoLink;
import com.bytepath.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentVideoLinkRepository extends JpaRepository<StudentVideoLink, Long> {
    List<StudentVideoLink> findByUserAndSemesterNumberOrderByCreatedAtDesc(User user, int semesterNumber);
}
