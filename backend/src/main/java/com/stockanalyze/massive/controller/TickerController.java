package com.stockanalyze.massive.controller;

import com.stockanalyze.massive.client.MassiveClient;
import com.stockanalyze.massive.model.TickerResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // For development
public class TickerController {

    private final MassiveClient massiveClient;

    @Value("${massive.api.key}")
    private String apiKey;

    public TickerController(MassiveClient massiveClient) {
        this.massiveClient = massiveClient;
    }

    @GetMapping(value = "/tickers", produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public TickerResponse getTickers(
            @RequestParam(required = false) String ticker,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String market,
            @RequestParam(required = false) String exchange,
            @RequestParam(required = false) String cusip,
            @RequestParam(required = false) String cik,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "true") Boolean active,
            @RequestParam(defaultValue = "100") Integer limit,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String order) {
        return massiveClient.getTickers(ticker, type, market, exchange, cusip, cik, date, search, active, limit, sort,
                order, apiKey);
    }
}
