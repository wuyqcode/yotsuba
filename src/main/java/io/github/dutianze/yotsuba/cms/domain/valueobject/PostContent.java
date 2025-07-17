package io.github.dutianze.yotsuba.cms.domain.valueobject;

import jakarta.persistence.Embeddable;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
@Embeddable
public record PostContent(
        @FullTextField(analyzer = "english", name = "content_en")
        @FullTextField(analyzer = "japanese", name = "content_ja")
        @FullTextField(analyzer = "chinese", name = "content_cn")
        String content)  {
}
