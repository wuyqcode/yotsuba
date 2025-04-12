package io.github.dutianze.yotsuba.cms.domain.valueobject;

import jakarta.persistence.Embeddable;
import org.jmolecules.ddd.types.ValueObject;

/**
 * @author dutianze
 * @date 2024/8/3
 */
@Embeddable
public record PostTitle(String title) implements ValueObject {
}
