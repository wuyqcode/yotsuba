package io.github.dutianze.yotsuba.tool.domain.policy;

import io.github.dutianze.yotsuba_grpc.proto.TextProcessorGrpc.TextProcessorBlockingStub;
import io.github.dutianze.yotsuba_grpc.proto.Token;
import io.github.dutianze.yotsuba_grpc.proto.TokenizeReply;
import io.github.dutianze.yotsuba_grpc.proto.TokenizeRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * @author dutianze
 * @date 2024/7/9
 */
@Service
public class PolicyManager {

    private final List<Policy> policies;
    @Autowired
    private TextProcessorBlockingStub textProcessorBlockingStub;

    public PolicyManager(List<Policy> policies) {
        this.policies = policies;
    }

    public String convert(String text, Map<String, String> englishContext) {
        TokenizeReply tokenizeReply = textProcessorBlockingStub.tokenize(
                TokenizeRequest.newBuilder().setText(text).build());
        List<Token> tokensList = tokenizeReply.getTokensList();
        if (tokensList.isEmpty()) {
            return text;
        }
        StringBuilder result = new StringBuilder();
        for (Token token : tokensList) {
            TokenRecord tokenRecord = new TokenRecord(token.getSurface(), token.getReading());
            String convertedText = policies.stream()
                                           .sorted(Comparator.comparing(Policy::priority))
                                           .filter(policy -> policy.canApply(tokenRecord))
                                           .findFirst()
                                           .map(policy -> policy.apply(new PolicyContext(tokenRecord, englishContext)))
                                           .orElseGet(tokenRecord::surface);
            result.append(convertedText);
        }
        return result.toString();
    }
}
