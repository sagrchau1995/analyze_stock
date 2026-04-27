package com.stockanalyze.massive.client;

import com.stockanalyze.massive.model.TickerResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "massive-api", url = "https://api.massive.com")
public interface MassiveClient {

    @GetMapping("/v3/reference/tickers")
    TickerResponse getTickers(
            @RequestParam(value = "ticker", required = false) String ticker,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "market", required = false) String market,
            @RequestParam(value = "exchange", required = false) String exchange,
            @RequestParam(value = "cusip", required = false) String cusip,
            @RequestParam(value = "cik", required = false) String cik,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "limit", required = false) Integer limit,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "order", required = false) String order,
            @RequestParam(value = "apiKey", required = false) String apiKey);
}
