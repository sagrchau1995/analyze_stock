package com.stockanalyze.massive.controller;

import com.stockanalyze.massive.model.TickerEntity;
import com.stockanalyze.massive.model.TickerResponse;
import com.stockanalyze.massive.service.TickerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // For development
public class TickerController {

    private final TickerService tickerService;

    public TickerController(TickerService tickerService) {
        this.tickerService = tickerService;
    }

    @PostMapping("/tickers/fetch")
    public ResponseEntity<Map<String, Object>> fetchAllTickers() {
        try {
            long startTime = System.currentTimeMillis();
            long totalCount = tickerService.getTotalCount();
            boolean didFetch = false;

            if (totalCount == 0) {
                tickerService.fetchAndStoreAllTickers();
                didFetch = true;
            }

            long endTime = System.currentTimeMillis();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", didFetch ? "All tickers fetched and stored successfully"
                    : "Database already contains ticker data, no API call made");
            response.put("totalTickers", tickerService.getTotalCount());
            response.put("durationMs", (endTime - startTime));
            response.put("apiCallMade", didFetch);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to fetch tickers: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/tickers")
    public ResponseEntity<TickerResponse> getTickers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String market) {

        try {
            List<TickerEntity> tickers;

            if (type != null && !type.isEmpty()) {
                tickers = tickerService.getTickersByType(type);
            } else if (market != null && !market.isEmpty()) {
                tickers = tickerService.getTickersByMarket(market);
            } else if (search != null && !search.isEmpty()) {
                tickers = tickerService.searchTickers(search);
            } else {
                tickers = tickerService.getAllTickers();
            }

            TickerResponse response = new TickerResponse();
            response.setResults(tickers.stream()
                    .map(this::convertEntityToResult)
                    .collect(java.util.stream.Collectors.toList()));
            response.setCount(tickers.size());
            response.setStatus("OK");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            TickerResponse errorResponse = new TickerResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setCount(0);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/tickers/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTickers", tickerService.getTotalCount());
        stats.put("types", getTypeStats());
        return ResponseEntity.ok(stats);
    }

    private Map<String, Long> getTypeStats() {
        Map<String, Long> typeStats = new HashMap<>();
        // Common ticker types
        String[] types = { "CS", "ETF", "ADR", "FUND", "INDEX", "CRYPTO", "FOREX" };
        for (String type : types) {
            long count = tickerService.countByType(type);
            if (count > 0) {
                typeStats.put(type, count);
            }
        }
        return typeStats;
    }

    private com.stockanalyze.massive.model.TickerResult convertEntityToResult(TickerEntity entity) {
        com.stockanalyze.massive.model.TickerResult result = new com.stockanalyze.massive.model.TickerResult();
        result.setTicker(entity.getTicker());
        result.setName(entity.getName());
        result.setMarket(entity.getMarket());
        result.setType(entity.getType());
        result.setActive(entity.getActive());
        result.setLocale(entity.getLocale());
        result.setCurrency_name(entity.getCurrencyName());
        result.setPrimary_exchange(entity.getPrimaryExchange());
        result.setCik(entity.getCik());
        result.setComposite_figi(entity.getCompositeFigi());
        result.setShare_class_figi(entity.getShareClassFigi());
        result.setLast_updated_utc(entity.getLastUpdatedUtc());
        return result;
    }
}
