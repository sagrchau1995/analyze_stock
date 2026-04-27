package com.stockanalyze.massive.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Maps a single entry from the Finnhub GET /api/v1/stock/symbol response.
 * Example fields: symbol, description, displaySymbol, currency, mic, type,
 * figi, etc.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FinnhubSymbol {

    /** The ticker symbol, e.g. "AAPL" */
    private String symbol;

    /** Full company description / name, e.g. "Apple Inc" */
    private String description;

    /** Display symbol, same as symbol in most cases */
    private String displaySymbol;

    /** ISO 4217 currency code, e.g. "USD" */
    private String currency;

    /** Market Identifier Code (exchange), e.g. "XNAS" */
    private String mic;

    /** Security type, e.g. "Common Stock" */
    private String type;

    private String figi;
    private String figiComposite;
    private String isin;
    private String shareClassFIGI;
    private String symbol2;

    // ------------------------------------------------------------------
    // Getters / Setters (Lombok @Data generates these, kept explicit for
    // IDE compatibility without annotation processing configured).
    // ------------------------------------------------------------------

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDisplaySymbol() {
        return displaySymbol;
    }

    public void setDisplaySymbol(String displaySymbol) {
        this.displaySymbol = displaySymbol;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getMic() {
        return mic;
    }

    public void setMic(String mic) {
        this.mic = mic;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFigi() {
        return figi;
    }

    public void setFigi(String figi) {
        this.figi = figi;
    }

    public String getFigiComposite() {
        return figiComposite;
    }

    public void setFigiComposite(String figiComposite) {
        this.figiComposite = figiComposite;
    }

    public String getIsin() {
        return isin;
    }

    public void setIsin(String isin) {
        this.isin = isin;
    }

    public String getShareClassFIGI() {
        return shareClassFIGI;
    }

    public void setShareClassFIGI(String shareClassFIGI) {
        this.shareClassFIGI = shareClassFIGI;
    }

    public String getSymbol2() {
        return symbol2;
    }

    public void setSymbol2(String symbol2) {
        this.symbol2 = symbol2;
    }
}
