package com.stockanalyze.massive.client;

import com.stockanalyze.massive.model.TickerResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "massive-api", url = "https://api.massive.com")
public interface MassiveClient {

    @GetMapping("/v3/reference/tickers")
    TickerResponse getTickers(
            @RequestParam("ticker") String ticker,
            @RequestParam("type") String type,
            @RequestParam("market") String market,
            @RequestParam("exchange") String exchange,
            @RequestParam("cusip") String cusip,
            @RequestParam("cik") String cik,
            @RequestParam("date") String date,
            @RequestParam("search") String search,
            @RequestParam("active") Boolean active,
            @RequestParam("limit") Integer limit,
            @RequestParam("sort") String sort,
            @RequestParam("order") String order,
            @RequestParam("apiKey") String apiKey);
}
