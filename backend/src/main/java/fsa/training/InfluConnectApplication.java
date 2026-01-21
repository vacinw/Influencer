package fsa.training;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "fsa.training.dao")
@EntityScan(basePackages = "fsa.training.entity")
public class InfluConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(InfluConnectApplication.class, args);
    }
}
