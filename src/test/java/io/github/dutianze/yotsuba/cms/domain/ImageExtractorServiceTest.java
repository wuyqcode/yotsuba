package io.github.dutianze.yotsuba.cms.domain;

import io.github.dutianze.yotsuba.cms.infrastructure.MarkdownExtractServiceImpl;
import io.github.dutianze.yotsuba.file.FileResourceId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author dutianze
 * @date 2024/9/29
 */
class ImageExtractorServiceTest {

    private MarkdownExtractService markdownExtractService;

    @BeforeEach
    void setUp() {
        markdownExtractService = new MarkdownExtractServiceImpl();
    }

    @Test
    void testExtractImageUrls() {
        String markdown =
                "这是一个测试 ![图片1](http://example.com/image1.jpg) 包含图片 ![图片2](http://example.com/image2.png)";
        Set<FileResourceId> fileResourceIds = markdownExtractService.extractFileReferenceIds(markdown);

        assertEquals(2, fileResourceIds.size());
        assertTrue(fileResourceIds.stream().anyMatch(fileResourceId -> fileResourceId.id().equals("image1.jpg")));
        assertTrue(fileResourceIds.stream().anyMatch(fileResourceId -> fileResourceId.id().equals("image2.png")));
    }

    @Test
    void testExtractImageUrlsWithNoImages() {
        String markdown = "这是一个没有图片的测试文本";
        Set<FileResourceId> fileResourceIds = markdownExtractService.extractFileReferenceIds(markdown);

        assertTrue(fileResourceIds.isEmpty());
    }
}