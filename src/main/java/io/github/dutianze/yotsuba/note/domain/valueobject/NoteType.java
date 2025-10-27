package io.github.dutianze.yotsuba.note.domain.valueobject;


import lombok.Getter;

@Getter
public enum NoteType {

    WIKI("wiki"),
    MEDIA("media");

    private final String value;

    NoteType(String value) {
        this.value = value;
    }

}