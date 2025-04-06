package io.github.dutianze.yotsuba.file;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * @author dutianze
 * @date 2025/4/5
 */
@Configuration(proxyBeanMethods = false)
public class FileFlywayConfig {

    @ConfigurationProperties(prefix = "modules.file.flyway")
    public record FtsFlywayProperties(String location) {
    }

    @Bean(initMethod = "migrate")
    public Flyway ftsFlyway(@Qualifier(FileDataSourceConfig.DATASOURCE) DataSource dataSource,
                            FtsFlywayProperties properties) {
        return Flyway.configure()
                     .dataSource(dataSource)
                     .locations(properties.location())
                     .load();
    }

}
