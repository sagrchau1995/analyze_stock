package com.stockanalyze.massive.service;

import com.stockanalyze.massive.client.FinnhubClient;
import com.stockanalyze.massive.model.FinnhubSymbol;
import com.stockanalyze.massive.model.TickerEntity;
import com.stockanalyze.massive.repository.TickerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TickerService {

    private final FinnhubClient finnhubClient;
    private final TickerRepository tickerRepository;

    @Value("${finnhub.api.key}")
    private String apiKey;

    public TickerService(FinnhubClient finnhubClient, TickerRepository tickerRepository) {
        this.finnhubClient = finnhubClient;
        this.tickerRepository = tickerRepository;
    }

    /**
     * Fetches all US stock symbols from Finnhub in a single API call (no
     * pagination)
     * and persists them to the database.
     */
    @Transactional
    public void fetchAndStoreAllTickers() {
        System.out.println("Fetching US stock symbols from Finnhub...");

        // Clear existing data
        tickerRepository.deleteAll();
        System.out.println("Cleared existing ticker data from database.");

        try {
            List<FinnhubSymbol> symbols = finnhubClient.getSymbols("US", apiKey);

            if (symbols == null || symbols.isEmpty()) {
                System.out.println("No symbols returned from Finnhub.");
                return;
            }

            System.out.println("Received " + symbols.size() + " symbols from Finnhub.");

            List<TickerEntity> entities = symbols.stream()
                    .filter(s -> s.getSymbol() != null && !s.getSymbol().isBlank())
                    .map(TickerEntity::fromFinnhubSymbol)
                    .collect(Collectors.toList());

            tickerRepository.saveAll(entities);
            System.out.println("Stored " + entities.size() + " tickers in the database.");

        } catch (Exception e) {
            System.err.println("Error fetching symbols from Finnhub: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch tickers from Finnhub: " + e.getMessage(), e);
        }
    }

    public List<TickerEntity> getAllTickers() {
        return tickerRepository.findAll();
    }

    public List<TickerEntity> searchTickers(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getAllTickers();
        }
        return tickerRepository.findByTickerOrNameContaining(search.trim());
    }

    public List<TickerEntity> getTickersByType(String type) {
        return tickerRepository.findByType(type);
    }

    public List<TickerEntity> getTickersByMarket(String market) {
        return tickerRepository.findByMarket(market);
    }

    public long countByType(String type) {
        return tickerRepository.countByType(type);
    }

    public long getTotalCount() {
        return tickerRepository.count();
    }
}