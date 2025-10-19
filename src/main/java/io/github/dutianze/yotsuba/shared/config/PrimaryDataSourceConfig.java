package io.github.dutianze.yotsuba.shared.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.sqlite.SQLiteConfig;
import org.sqlite.SQLiteOpenMode;

import javax.sql.DataSource;

import static io.github.dutianze.yotsuba.shared.config.PrimaryDataSourceConfig.ENTITY_MANAGER_FACTORY;
import static io.github.dutianze.yotsuba.shared.config.PrimaryDataSourceConfig.PLATFORM_TX_MANAGER;

/**
 * 主数据源配置类。
 * 配置内容包括：
 * - JPA 实体管理器工厂（EntityManagerFactory）
 * - 事务管理器（TransactionManager）
 * - Repository 扫描路径
 *
 * @author dutianze
 * @date 2025/4/5
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        entityManagerFactoryRef = ENTITY_MANAGER_FACTORY,
        transactionManagerRef = PLATFORM_TX_MANAGER,
        basePackages = {
                "io.github.dutianze.yotsuba.note",
                "io.github.dutianze.yotsuba.shared",
                "io.github.dutianze.yotsuba.search",
                "org.springframework"
        }
)
public class PrimaryDataSourceConfig {

    public static final String JPA_PROPS = "modules.primary.jpa";
    public static final String DATASOURCE = "modules.primary.datasource";
    public static final String[] BASE_PACKAGES = {
            "io.github.dutianze.yotsuba.note",
            "io.github.dutianze.yotsuba.shared",
            "io.github.dutianze.yotsuba.search",
            "org.springframework"

    };

    public static final String PERSISTENCE_UNIT = "PRIMARY_PERSISTENCE_UNIT";
    public static final String ENTITY_MANAGER = "PRIMARY_ENTITY_MANAGER";
    public static final String ENTITY_MANAGER_FACTORY = "PRIMARY_ENTITY_MANAGER_FACTORY";
    public static final String PLATFORM_TX_MANAGER = "PRIMARY_PLATFORM_TX_MANAGER";

    /**
     * 读取主数据源的数据库连接配置，如 URL、驱动类名、用户名、密码等。
     * 对应配置项为 application.yml 中的 primary.datasource。
     *
     * @return 主数据源的 DataSourceProperties 实例
     */
    @Primary
    @Bean("primaryDataSourceProperties")
    @ConfigurationProperties(prefix = DATASOURCE)
    public DataSourceProperties primaryDataSourceProperties() {
        return new DataSourceProperties();
    }

    /**
     * 根据主数据源配置创建 DataSource 实例。
     *
     * @return 主数据源的 DataSource 实例
     */
    @Primary
    @Bean(name = DATASOURCE)
    public DataSource dataSource(@Qualifier("primaryDataSourceProperties") DataSourceProperties dataSourceProperties) {
        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setDriverClassName(dataSourceProperties.getDriverClassName());
        hikariConfig.setJdbcUrl(dataSourceProperties.getUrl());
        hikariConfig.setMaximumPoolSize(1);
        hikariConfig.setConnectionTestQuery("SELECT 1");
        SQLiteConfig config = new SQLiteConfig();
        config.setOpenMode(SQLiteOpenMode.OPEN_URI);
        config.setOpenMode(SQLiteOpenMode.FULLMUTEX);
        config.setBusyTimeout(10000);
        hikariConfig.setPoolName("primaryHikariCP");
        hikariConfig.addDataSourceProperty(SQLiteConfig.Pragma.OPEN_MODE.pragmaName, config.getOpenModeFlags());
        hikariConfig.addDataSourceProperty(SQLiteConfig.Pragma.JOURNAL_MODE.pragmaName, SQLiteConfig.JournalMode.WAL);
        return new HikariDataSource(hikariConfig);
    }

    /**
     * 读取主数据源的 JPA 配置，例如 Hibernate 的方言、ddl-auto 等设置。
     * 对应配置项为 application.yml 中的 primary.jpa。
     *
     * @return 主数据源的 JpaProperties 实例
     */
    @Bean(name = JPA_PROPS)
    @Primary
    @ConfigurationProperties(JPA_PROPS)
    public JpaProperties jpaProperties() {
        return new JpaProperties();
    }

    /**
     * 创建主数据源的 EntityManagerFactory，用于管理 JPA 实体类与数据库之间的映射。
     *
     * @param dataSource    主数据源
     * @param jpaProperties 主数据源的 JPA 配置
     * @param builder       EntityManagerFactory 构建器
     * @return 主数据源的 EntityManagerFactory 实例
     */
    @Primary
    @Bean(name = ENTITY_MANAGER_FACTORY)
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            @Qualifier(DATASOURCE) DataSource dataSource,
            @Qualifier(JPA_PROPS) JpaProperties jpaProperties, EntityManagerFactoryBuilder builder) {
        return builder
                .dataSource(dataSource)
                .packages(BASE_PACKAGES)
                .persistenceUnit(PERSISTENCE_UNIT)
                .properties(jpaProperties.getProperties())
                .build();
    }

    /**
     * 创建主数据源的事务管理器，用于管理基于注解（如 @Transactional）的事务。
     *
     * @param entityManagerFactory 主数据源的 EntityManagerFactory
     * @return 主数据源的事务管理器 PlatformTransactionManager 实例
     */
    @Primary
    @Bean(name = PLATFORM_TX_MANAGER)
    public PlatformTransactionManager platformTransactionManager(@Qualifier(ENTITY_MANAGER_FACTORY)
                                                                 EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }


}
