package io.github.dutianze.yotsuba;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

/**
 * @author dutianze
 * @date 2024/8/1
 */
class ApplicationTest {

    ApplicationModules modules = ApplicationModules.of(Application.class);

    @Test
    void verifiesArchitecture() {
        System.out.println(modules);
        modules.verify();
    }

    @Test
    void createDocumentation() {
        new Documenter(modules)
                .writeDocumentation()
                .writeModulesAsPlantUml()
                .writeIndividualModulesAsPlantUml().writeModuleCanvases();
    }

}