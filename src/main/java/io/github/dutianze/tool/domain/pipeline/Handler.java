package io.github.dutianze.tool.domain.pipeline;


/**
 * @author dutianze
 * @date 2024/7/5
 */
public interface Handler<I, O> {
    O process(I input);
}