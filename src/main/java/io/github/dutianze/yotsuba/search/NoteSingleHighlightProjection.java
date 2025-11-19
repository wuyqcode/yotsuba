package io.github.dutianze.yotsuba.search;

import io.github.dutianze.yotsuba.note.domain.Note;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.EntityProjection;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.HighlightProjection;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.ProjectionConstructor;

@ProjectionConstructor
public record NoteSingleHighlightProjection(
    @HighlightProjection(path = "content.content_en") String enHighlight,
    @HighlightProjection(path = "content.content_cn") String cnHighlight,
    @HighlightProjection(path = "content.content_ja") String jaHighlight,
    @EntityProjection Note note
) {

}
