package io.github.dutianze.yotsuba.shared.config;

import jakarta.validation.constraints.NotEmpty;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * @author dutianze
 * @date 2025/4/5
 */
@Configuration(proxyBeanMethods = false)
public class PrimaryFlywayConfig {

    @ConfigurationProperties(prefix = "modules.primary.flyway")
    public record PrimaryFlywayProperties(@NotEmpty String location) {
    }

    @Primary
    @Bean(initMethod = "migrate")
    public Flyway primaryFlyway(@Qualifier(PrimaryDataSourceConfig.DATASOURCE) DataSource dataSource,
                                PrimaryFlywayProperties properties) {
        return Flyway.configure()
                     .dataSource(dataSource)
                     .locations(properties.location())
                     .load();
    }

}
