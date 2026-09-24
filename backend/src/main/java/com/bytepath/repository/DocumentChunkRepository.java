package com.bytepath.repository;

import com.bytepath.model.DocumentChunk;
import com.bytepath.model.PyqResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    List<DocumentChunk> findByResourceOrderByChunkIndexAsc(PyqResource resource);
    void deleteByResource(PyqResource resource);
}
