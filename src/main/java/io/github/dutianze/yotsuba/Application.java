package io.github.dutianze.yotsuba;

import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.theme.NoTheme;
import com.vaadin.flow.theme.Theme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.modulith.Modulithic;

@Modulithic(sharedModules = "shared")
@SpringBootApplication
@ConfigurationPropertiesScan
@NoTheme
public class Application implements AppShellConfigurator {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
