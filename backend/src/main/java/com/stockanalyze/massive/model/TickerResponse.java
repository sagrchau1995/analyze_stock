package com.stockanalyze.massive.model;

import lombok.Data;
import java.util.List;

@Data
public class TickerResponse {
    private Integer count;
    private String next_url;
    private String request_id;
    private List<TickerResult> results;
    private String status;

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public String getNext_url() {
        return next_url;
    }

    public void setNext_url(String next_url) {
        this.next_url = next_url;
    }

    public String getRequest_id() {
        return request_id;
    }

    public void setRequest_id(String request_id) {
        this.request_id = request_id;
    }

    public List<TickerResult> getResults() {
        return results;
    }

    public void setResults(List<TickerResult> results) {
        this.results = results;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
