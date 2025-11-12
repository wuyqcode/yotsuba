package io.github.dutianze.yotsuba.search;

import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import org.hibernate.search.mapper.pojo.bridge.IdentifierBridge;
import org.hibernate.search.mapper.pojo.bridge.runtime.IdentifierBridgeFromDocumentIdentifierContext;
import org.hibernate.search.mapper.pojo.bridge.runtime.IdentifierBridgeToDocumentIdentifierContext;

public class NoteIdentifierBridge implements IdentifierBridge<NoteId> {

  @Override
  public String toDocumentIdentifier(NoteId value,
      IdentifierBridgeToDocumentIdentifierContext context) {
    return value.id();
  }

  @Override
  public NoteId fromDocumentIdentifier(String documentIdentifier,
      IdentifierBridgeFromDocumentIdentifierContext context) {
    return new NoteId(documentIdentifier);
  }

}
