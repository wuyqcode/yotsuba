package io.github.dutianze.yotsuba.file.config;

import static io.github.dutianze.yotsuba.file.config.FileDataSourceConfig.ENTITY_MANAGER_FACTORY;
import static io.github.dutianze.yotsuba.file.config.FileDataSourceConfig.PLATFORM_TX_MANAGER;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.jdbc.JdbcProperties;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@EnableJpaRepositories(
    entityManagerFactoryRef = ENTITY_MANAGER_FACTORY,
    transactionManagerRef = PLATFORM_TX_MANAGER,
    basePackages = {"io.github.dutianze.yotsuba.file"}
)
public class FileDataSourceConfig {

  public static final String JPA_PROPS = "modules.file.jpa";
  public static final String JDBC_PROPS = "modules.file.jdbc";
  public static final String DATASOURCE = "modules.file.datasource";
  public static final String PERSISTENCE_UNIT = "FILE_PERSISTENCE_UNIT";
  public static final String JDBC_TEMPLATE = "FILE_JDBC_TEMPLATE";
  public static final String ENTITY_MANAGER_FACTORY = "FILE_ENTITY_MANAGER_FACTORY";
  public static final String PLATFORM_TX_MANAGER = "FILE_PLATFORM_TX_MANAGER";


  @Bean
  @ConfigurationProperties(prefix = DATASOURCE)
  public DataSourceProperties fileDataSourceProperties() {
    return new DataSourceProperties();
  }

  @Bean(name = DATASOURCE)
  public DataSource dataSource() {
    return fileDataSourceProperties().initializeDataSourceBuilder().build();
  }

  @Bean(name = JPA_PROPS)
  @ConfigurationProperties(JPA_PROPS)
  public JpaProperties jpaProperties() {
    return new JpaProperties();
  }

  @Bean(name = JDBC_PROPS)
  @ConfigurationProperties(JDBC_PROPS)
  public JdbcProperties jdbcProperties() {
    return new JdbcProperties();
  }

  @Bean(name = ENTITY_MANAGER_FACTORY)
  public LocalContainerEntityManagerFactoryBean entityManagerFactory(
      @Qualifier(DATASOURCE) DataSource dataSource,
      @Qualifier(JPA_PROPS) JpaProperties jpaProperties,
      EntityManagerFactoryBuilder builder) {
    return builder
        .dataSource(dataSource)
        .packages("io.github.dutianze.yotsuba.file")
        .persistenceUnit(PERSISTENCE_UNIT)
        .properties(jpaProperties.getProperties())
        .build();
  }

  @Bean(JDBC_TEMPLATE)
  public JdbcTemplate jdbcTemplate(@Qualifier(DATASOURCE) DataSource dataSource,
      @Qualifier(JDBC_PROPS) JdbcProperties properties) {
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
    JdbcProperties.Template template = properties.getTemplate();
    jdbcTemplate.setFetchSize(template.getFetchSize());
    jdbcTemplate.setMaxRows(template.getMaxRows());
    if (template.getQueryTimeout() != null) {
      jdbcTemplate.setQueryTimeout((int) template.getQueryTimeout().getSeconds());
    }
    return jdbcTemplate;
  }

  @Bean(name = PLATFORM_TX_MANAGER)
  public PlatformTransactionManager platformTransactionManager(
      @Qualifier(ENTITY_MANAGER_FACTORY) EntityManagerFactory entityManagerFactory) {
    return new JpaTransactionManager(entityManagerFactory);
  }
}
