package io.github.dutianze.yotsuba.cms.domain.valueobject;

import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.jmolecules.ddd.types.ValueObject;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
public record PostContent(
        @FullTextField(analyzer = "english", name = "content_en")
        @FullTextField(analyzer = "japanese", name = "content_ja")
        @FullTextField(analyzer = "chinese", name = "content_cn")
        String content) implements ValueObject {
}
