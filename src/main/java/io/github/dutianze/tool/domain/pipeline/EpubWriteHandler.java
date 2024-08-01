package io.github.dutianze.tool.domain.pipeline;

import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.epub.EpubWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * @author dutianze
 * @date 2024/7/5
 */
public class EpubWriteHandler implements Handler<Book, ByteArrayOutputStream> {

    @Override
    public ByteArrayOutputStream process(Book input) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            EpubWriter epubWriter = new EpubWriter();
            epubWriter.write(input, outputStream);
            return outputStream;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
