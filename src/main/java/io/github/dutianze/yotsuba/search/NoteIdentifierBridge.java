package io.github.dutianze.yotsuba.search;


import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;

public class NoteIdentifierBridge extends GenericIdentifierBridge<NoteId> {

  public NoteIdentifierBridge() {
    super(NoteId::id, NoteId::new);
  }
}
