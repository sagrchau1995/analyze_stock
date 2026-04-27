package com.stockanalyze.massive.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tickers")
@Data
public class TickerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ticker;

    @Column(nullable = false)
    private String name;

    @Column
    private String market;

    @Column
    private String type;

    @Column
    private Boolean active;

    @Column
    private String locale;

    @Column
    private String currencyName;

    @Column
    private String primaryExchange;

    @Column
    private String cik;

    @Column
    private String compositeFigi;

    @Column
    private String shareClassFigi;

    @Column
    private String lastUpdatedUtc;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMarket() {
        return market;
    }

    public void setMarket(String market) {
        this.market = market;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getCurrencyName() {
        return currencyName;
    }

    public void setCurrencyName(String currencyName) {
        this.currencyName = currencyName;
    }

    public String getPrimaryExchange() {
        return primaryExchange;
    }

    public void setPrimaryExchange(String primaryExchange) {
        this.primaryExchange = primaryExchange;
    }

    public String getCik() {
        return cik;
    }

    public void setCik(String cik) {
        this.cik = cik;
    }

    public String getCompositeFigi() {
        return compositeFigi;
    }

    public void setCompositeFigi(String compositeFigi) {
        this.compositeFigi = compositeFigi;
    }

    public String getShareClassFigi() {
        return shareClassFigi;
    }

    public void setShareClassFigi(String shareClassFigi) {
        this.shareClassFigi = shareClassFigi;
    }

    public String getLastUpdatedUtc() {
        return lastUpdatedUtc;
    }

    public void setLastUpdatedUtc(String lastUpdatedUtc) {
        this.lastUpdatedUtc = lastUpdatedUtc;
    }

    public static TickerEntity fromTickerResult(TickerResult result) {
        TickerEntity entity = new TickerEntity();
        entity.setTicker(result.getTicker());
        entity.setName(result.getName());
        entity.setMarket(result.getMarket());
        entity.setType(result.getType());
        entity.setActive(result.getActive());
        entity.setLocale(result.getLocale());
        entity.setCurrencyName(result.getCurrency_name());
        entity.setPrimaryExchange(result.getPrimary_exchange());
        entity.setCik(result.getCik());
        entity.setCompositeFigi(result.getComposite_figi());
        entity.setShareClassFigi(result.getShare_class_figi());
        entity.setLastUpdatedUtc(result.getLast_updated_utc());
        return entity;
    }

    /**
     * Creates a TickerEntity from a Finnhub symbol response object.
     * Finnhub fields: symbol → ticker, description → name, mic → primaryExchange,
     * currency → currencyName, type → type.
     */
    public static TickerEntity fromFinnhubSymbol(FinnhubSymbol s) {
        TickerEntity entity = new TickerEntity();
        entity.setTicker(s.getSymbol());
        entity.setName(s.getDescription() != null ? s.getDescription() : s.getSymbol());
        entity.setMarket("stocks");
        entity.setType(s.getType());
        entity.setActive(true);
        entity.setLocale("us");
        entity.setCurrencyName(s.getCurrency());
        entity.setPrimaryExchange(s.getMic());
        entity.setCompositeFigi(s.getFigiComposite());
        entity.setShareClassFigi(s.getShareClassFIGI());
        return entity;
    }
}