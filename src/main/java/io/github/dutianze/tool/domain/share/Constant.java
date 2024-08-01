package io.github.dutianze.tool.domain.share;

import com.atilika.kuromoji.jumandic.Tokenizer;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public interface Constant {

    Tokenizer tokenizer = new Tokenizer();

    ObjectMapper objectMapper = new ObjectMapper();

}
