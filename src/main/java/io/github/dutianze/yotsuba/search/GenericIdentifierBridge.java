package io.github.dutianze.yotsuba.search;

import java.util.function.Function;
import org.hibernate.search.mapper.pojo.bridge.IdentifierBridge;
import org.hibernate.search.mapper.pojo.bridge.runtime.IdentifierBridgeFromDocumentIdentifierContext;
import org.hibernate.search.mapper.pojo.bridge.runtime.IdentifierBridgeToDocumentIdentifierContext;

public class GenericIdentifierBridge<T> implements IdentifierBridge<T> {

  private final Function<T, String> idExtractor;
  private final Function<String, T> idFactory;

  public GenericIdentifierBridge(Function<T, String> idExtractor, Function<String, T> idFactory) {
    this.idExtractor = idExtractor;
    this.idFactory = idFactory;
  }

  @Override
  public String toDocumentIdentifier(T value,
      IdentifierBridgeToDocumentIdentifierContext context) {
    return idExtractor.apply(value);
  }

  @Override
  public T fromDocumentIdentifier(String documentIdentifier,
      IdentifierBridgeFromDocumentIdentifierContext context) {
    return idFactory.apply(documentIdentifier);
  }
}

