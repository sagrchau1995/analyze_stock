package com.stockanalyze.massive.client;

import com.stockanalyze.massive.model.FinnhubSymbol;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Feign client for the Finnhub stock symbol endpoint.
 * GET https://finnhub.io/api/v1/stock/symbol?exchange=US&token=<token>
 * Returns a flat JSON array of FinnhubSymbol objects (no pagination).
 */
@FeignClient(name = "finnhub-api", url = "https://finnhub.io")
public interface FinnhubClient {

    @GetMapping("/api/v1/stock/symbol")
    List<FinnhubSymbol> getSymbols(
            @RequestParam("exchange") String exchange,
            @RequestParam("token") String token);
}
