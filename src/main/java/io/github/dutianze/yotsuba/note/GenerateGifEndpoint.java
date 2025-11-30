package io.github.dutianze.yotsuba.note;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.domain.FileResource;
import io.github.dutianze.yotsuba.file.service.FileService;
import io.github.dutianze.yotsuba.note.application.SpriteSeekToGifService;
import io.github.dutianze.yotsuba.shared.common.ReferenceCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;

/**
 * GIF 生成端点
 */
@Endpoint
@AnonymousAllowed
@RequiredArgsConstructor
public class GenerateGifEndpoint {

    private final SpriteSeekToGifService spriteSeekToGifService;
    private final FileService fileService;

    /**
     * 从 URL 前缀生成 GIF 并直接保存
     *
     * @param seekPrefix URL 前缀
     * @param start 起始索引
     * @param end 结束索引
     * @param noteId Note ID，用于关联文件
     * @return 保存的 FileResource
     */
    public FileResource generateGif(String seekPrefix, int start, int end, String noteId) throws Exception {
        // 生成 GIF
        byte[] gifBytes = spriteSeekToGifService.generateGifAndSave(seekPrefix, start, end);
        
        // 保存 GIF
        String filename = String.format("sprite-seek-%d-%d.gif", start, end);
        MultipartFile multipartFile = new ByteArrayMultipartFile(gifBytes, filename, MediaType.IMAGE_GIF_VALUE);
        return fileService.upload(multipartFile, "123", noteId, ReferenceCategory.NOTE_ATTACHMENT);
    }

    /**
     * 从字节数组创建 MultipartFile 的简单实现
     */
    private static class ByteArrayMultipartFile implements MultipartFile {
        private final byte[] content;
        private final String name;
        private final String contentType;

        public ByteArrayMultipartFile(byte[] content, String name, String contentType) {
            this.content = content;
            this.name = name;
            this.contentType = contentType;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return name;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() {
            return content;
        }

        @Override
        public InputStream getInputStream() {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            Files.write(dest.toPath(), content);
        }
    }
}

