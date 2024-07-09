package io.github.dutianze.domain.pipeline;

import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.epub.EpubReader;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * @author dutianze
 * @date 2024/7/5
 */
public class EpubReadingHandler implements Handler<MultipartFile, Book> {

    @Override
    public Book process(MultipartFile input) {
        EpubReader epubReader = new EpubReader();
        try {
            return epubReader.readEpub(input.getInputStream());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
