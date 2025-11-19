package io.github.dutianze.yotsuba.note.domain.valueobject;

import jakarta.persistence.Embeddable;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.search.engine.backend.types.Highlightable;
import org.hibernate.search.engine.backend.types.Projectable;
import org.hibernate.search.engine.backend.types.TermVector;
import org.hibernate.search.mapper.pojo.bridge.mapping.annotation.ValueBridgeRef;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;

@Embeddable
public record NoteTitle(
    @FullTextField(
        analyzer = "english",
        name = "content_en",
        termVector = TermVector.WITH_POSITIONS_OFFSETS,
        projectable = Projectable.YES,
        highlightable = Highlightable.ANY,
        valueBridge = @ValueBridgeRef(type = HtmlStripBridge.class)
    )
    @FullTextField(
        analyzer = "japanese",
        name = "content_ja",
        termVector = TermVector.WITH_POSITIONS_OFFSETS,
        projectable = Projectable.YES,
        highlightable = Highlightable.ANY,
        valueBridge = @ValueBridgeRef(type = HtmlStripBridge.class)
    )
    @FullTextField(
        analyzer = "chinese",
        name = "content_cn",
        termVector = TermVector.WITH_POSITIONS_OFFSETS,
        projectable = Projectable.YES,
        highlightable = Highlightable.ANY,
        valueBridge = @ValueBridgeRef(type = HtmlStripBridge.class)
    ) String title) {

    public NoteTitle {
        String t = StringUtils.trim(title);
        if (StringUtils.isBlank(t)) {
            t = "未命名";
        }
        title = t;
    }

    public NoteTitle() {
        this("未命名");
    }
}
