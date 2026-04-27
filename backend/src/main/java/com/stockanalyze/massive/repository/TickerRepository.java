package com.stockanalyze.massive.repository;

import com.stockanalyze.massive.model.TickerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TickerRepository extends JpaRepository<TickerEntity, Long> {

    List<TickerEntity> findByMarket(String market);

    List<TickerEntity> findByType(String type);

    List<TickerEntity> findByActive(Boolean active);

    @Query("SELECT t FROM TickerEntity t WHERE " +
            "LOWER(t.ticker) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<TickerEntity> findByTickerOrNameContaining(@Param("search") String search);

    long countByType(String type);

    boolean existsByTicker(String ticker);
}