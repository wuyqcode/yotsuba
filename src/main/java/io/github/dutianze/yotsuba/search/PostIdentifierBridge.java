package io.github.dutianze.yotsuba.search;

import org.hibernate.search.mapper.pojo.bridge.IdentifierBridge;
import org.hibernate.search.mapper.pojo.bridge.runtime.IdentifierBridgeFromDocumentIdentifierContext;
import org.hibernate.search.mapper.pojo.bridge.runtime.IdentifierBridgeToDocumentIdentifierContext;

import io.github.dutianze.yotsuba.note.domain.PostId;

/**
 * @author dutianze
 * @date 2025/4/6
 */
public class PostIdentifierBridge implements IdentifierBridge<PostId> {

    @Override
    public String toDocumentIdentifier(PostId value,
                                       IdentifierBridgeToDocumentIdentifierContext context) {
        return value.id();
    }

    @Override
    public PostId fromDocumentIdentifier(String documentIdentifier,
                                         IdentifierBridgeFromDocumentIdentifierContext context) {
        return new PostId(documentIdentifier);
    }

}