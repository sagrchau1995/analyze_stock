package com.stockanalyze.massive.service;

import com.stockanalyze.massive.client.MassiveClient;
import com.stockanalyze.massive.model.TickerEntity;
import com.stockanalyze.massive.model.TickerResponse;
import com.stockanalyze.massive.model.TickerResult;
import com.stockanalyze.massive.repository.TickerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TickerService {

    private final MassiveClient massiveClient;
    private final TickerRepository tickerRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${massive.api.key}")
    private String apiKey;

    public TickerService(MassiveClient massiveClient, TickerRepository tickerRepository) {
        this.massiveClient = massiveClient;
        this.tickerRepository = tickerRepository;
    }

    @Transactional
    public void fetchAndStoreAllTickers() {
        System.out.println("Starting comprehensive ticker data fetch...");

        // Clear existing data
        tickerRepository.deleteAll();
        System.out.println("Cleared existing data from database");

        int chunkSize = 100; // Fetch stocks in 100-item pages as per the API example
        int maxChunks = 50; // Safety limit to avoid runaway fetches
        int chunkCount = 0;
        String nextUrl = null;

        try {
            while (chunkCount < maxChunks) {
                chunkCount++;
                System.out.println("Fetching chunk " + chunkCount + " of " + maxChunks + "...");

                TickerResponse response;
                if (nextUrl == null) {
                    response = makeApiCallWithRetry(null, null, "stocks", null, null, null, null,
                            null, true, chunkSize, "ticker", "asc", chunkCount);
                } else {
                    response = makeApiCallByUrlWithRetry(nextUrl, chunkCount);
                }

                if (response != null && response.getResults() != null && !response.getResults().isEmpty()) {
                    List<TickerEntity> entities = response.getResults().stream()
                            .map(TickerEntity::fromTickerResult)
                            .collect(Collectors.toList());

                    tickerRepository.saveAll(entities);
                    System.out.println("Saved " + entities.size() + " tickers from chunk " + chunkCount +
                            " (Total so far: " + tickerRepository.count() + ")");

                    nextUrl = response.getNext_url();
                    if (nextUrl == null || nextUrl.isEmpty()) {
                        System.out.println("No next_url returned, reached the end of available data.");
                        break;
                    }

                    if (chunkCount < maxChunks) {
                        long delay = 3000 + (chunkCount * 500);
                        System.out.println("Waiting " + (delay / 1000) + "s before next chunk...");
                        Thread.sleep(delay);
                    }
                } else {
                    System.out.println("No more data or empty response, stopping fetch.");
                    break;
                }
            }

            System.out.println("Fetch completed! Total tickers stored: " + tickerRepository.count());
        } catch (Exception e) {
            System.err.println("Error during comprehensive fetch: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch tickers: " + e.getMessage(), e);
        }
    }

    private TickerResponse makeApiCallByUrlWithRetry(String url, int attemptNumber) throws Exception {
        int maxRetries = 5;
        long retryDelay = 15000;

        String requestUrl = url.startsWith("http") ? url : "https://api.massive.com" + url;
        if (!requestUrl.contains("apiKey=")) {
            requestUrl += requestUrl.contains("?") ? "&apiKey=" + apiKey : "?apiKey=" + apiKey;
        }

        for (int retry = 0; retry < maxRetries; retry++) {
            try {
                return restTemplate.getForObject(requestUrl, TickerResponse.class);
            } catch (Exception e) {
                String message = e.getMessage() != null ? e.getMessage() : "";
                if (message.contains("429") || message.contains("Too Many Requests")) {
                    if (retry < maxRetries - 1) {
                        long delay = retryDelay * (retry + 1);
                        System.out.println("Rate limited on next_url fetch (attempt " + (retry + 1) + "/" + maxRetries
                                + "), waiting " + (delay / 1000) + "s before retry...");
                        Thread.sleep(delay);
                    } else {
                        throw e;
                    }
                } else {
                    throw e;
                }
            }
        }
        return null;
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

    private TickerResponse makeApiCallWithRetry(String ticker, String type, String market, String exchange,
            String cusip, String cik, String date, String search, Boolean active, int limit,
            String sort, String order, int attemptNumber) throws Exception {

        int maxRetries = 5;
        long retryDelay = 15000; // 15 seconds base delay

        for (int retry = 0; retry < maxRetries; retry++) {
            try {
                return massiveClient.getTickers(ticker, type, market, exchange, cusip, cik, date,
                        search, active, limit, sort, order, apiKey);
            } catch (Exception e) {
                if (e.getMessage().contains("429") || e.getMessage().contains("Too Many Requests")) {
                    if (retry < maxRetries - 1) {
                        long delay = retryDelay * (retry + 1); // Exponential backoff
                        System.out.println("Rate limited (attempt " + (retry + 1) + "/" + maxRetries +
                                "), waiting " + (delay / 1000) + "s before retry...");
                        Thread.sleep(delay);
                    } else {
                        throw e;
                    }
                } else {
                    throw e;
                }
            }
        }
        return null;
    }
}