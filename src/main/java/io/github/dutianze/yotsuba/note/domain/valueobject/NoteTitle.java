package io.github.dutianze.yotsuba.note.domain.valueobject;

import jakarta.persistence.Embeddable;

@Embeddable
public record NoteTitle(String title) {

}
