package io.github.dutianze.yotsuba.tool.domain.pipeline;

import nl.siegmann.epublib.domain.Book;

import java.util.Map;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public record BookContext(Book book, Map<String, String> englishContext) {
}
