package com.stockanalyze.massive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class MassiveServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MassiveServiceApplication.class, args);
    }
}
