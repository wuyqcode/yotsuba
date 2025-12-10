package io.github.dutianze.yotsuba.tool;

import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.tool.domain.policy.PolicyManager;
import jakarta.annotation.security.PermitAll;
import java.util.LinkedHashMap;

@Endpoint
@PermitAll
public class TextConvertEndpoint {

    private final PolicyManager policyManager;

    public TextConvertEndpoint(PolicyManager policyManager) {
        this.policyManager = policyManager;
    }

    public String convertText(String text) {
        return policyManager.convert(text, new LinkedHashMap<>());
    }
}