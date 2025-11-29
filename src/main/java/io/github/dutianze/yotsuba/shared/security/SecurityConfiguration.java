package io.github.dutianze.yotsuba.shared.security;

import static com.vaadin.flow.spring.security.VaadinSecurityConfigurer.vaadin;

import com.vaadin.flow.spring.security.VaadinAwareSecurityContextHolderStrategyConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@Configuration
@Import(VaadinAwareSecurityContextHolderStrategyConfiguration.class)
public class SecurityConfiguration {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain vaadinSecurityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        // Public access
        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/**").permitAll());

        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/images/*.png").permitAll());

        // Icons from the line-awesome addon
        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/line-awesome/**").permitAll());

        http.with(vaadin(), vaadin -> {
            vaadin.loginView("/login");
        });
        http.headers(headers -> headers.frameOptions(FrameOptionsConfig::sameOrigin));

        return http.build();
    }

}
