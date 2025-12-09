package io.github.dutianze.yotsuba.tool.domain.common;

import com.atilika.kuromoji.ipadic.neologd.Tokenizer;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public interface Constant {

    Tokenizer tokenizer = new Tokenizer();

    ObjectMapper objectMapper = new ObjectMapper();

}
