package io.github.dutianze.yotsuba.shared.security;

import static com.vaadin.flow.spring.security.VaadinSecurityConfigurer.vaadin;

import com.vaadin.flow.spring.security.VaadinAwareSecurityContextHolderStrategyConfiguration;
import com.vaadin.flow.spring.security.stateless.VaadinStatelessSecurityConfigurer;
import java.util.Base64;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.JwsAlgorithms;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@Configuration
@Import(VaadinAwareSecurityContextHolderStrategyConfiguration.class)
public class SecurityConfiguration {

    @Value("${yotsuba.auth.secret}")
    private String authSecret;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain vaadinSecurityFilterChain(HttpSecurity http) throws Exception {
        // 禁用 Session
        http.sessionManagement(config -> config.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 注册登录页面
        http.with(vaadin(), vaadin -> vaadin.loginView("/login"));

        // Stateless 配置
        http.with(new VaadinStatelessSecurityConfigurer<>(),
                  cfg -> cfg.withSecretKey()
                            .secretKey(new SecretKeySpec(Base64.getDecoder().decode(authSecret), JwsAlgorithms.HS256)).and()
                            .issuer("io.github.dutianze"));

        http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        // Public access
        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/**").permitAll());

        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/images/*.png").permitAll());

        // Icons from the line-awesome addon
        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/line-awesome/**").permitAll());

        http.headers(headers -> headers.frameOptions(FrameOptionsConfig::sameOrigin));

        return http.build();
    }

}
