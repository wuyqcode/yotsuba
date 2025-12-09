package io.github.dutianze.yotsuba.note.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;

import javax.imageio.*;
import javax.imageio.metadata.*;
import javax.imageio.stream.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

/**
 * 下载 seek/_N.jpg 序列 → 每张切成 6×6(300×168) → 合并为 GIF
 */
@Service
public class SpriteSeekToGifService {

    private static final int TILE_W = 300;
    private static final int TILE_H = 168;
    private static final int COLS = 6, ROWS = 6;
    private static final int MAX_RETRY = 3;
    private static final int MAX_CONCURRENT = 30;
    private static final Duration TIMEOUT = Duration.ofSeconds(15);

    /**
     * 从 URL 前缀下载图片序列并生成 GIF
     *
     * @param seekPrefix URL 前缀，例如 "https://example.com/seek/"
     * @param start 起始索引
     * @param end 结束索引
     * @return GIF 文件的字节数组
     * @throws Exception 如果处理失败
     */
    public byte[] generateGifAndSave(String seekPrefix, int start, int end) throws Exception {
        if (!seekPrefix.endsWith("/")) {
            seekPrefix += "/";
        }

        Map<Integer, BufferedImage> imgs = downloadRange(seekPrefix, start, end);
        List<BufferedImage> allTiles = sliceAll2(imgs);
        return createGif(allTiles, 10);
    }


    /** 并发下载 */
    private Map<Integer, BufferedImage> downloadRange(String prefix, int start, int end) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                                      .connectTimeout(Duration.ofSeconds(10))
                                      .version(HttpClient.Version.HTTP_1_1)
                                      .build();
        Semaphore sem = new Semaphore(MAX_CONCURRENT);

        try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<Optional<IndexImg>>> list = new ArrayList<>();
            for (int i = start; i <= end; i++) {
                final int idx = i;
                list.add(CompletableFuture.supplyAsync(() -> {
                    try {
                        sem.acquire();
                        return fetchWithRetry(client, prefix, idx);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return Optional.<IndexImg>empty();
                    } finally {
                        sem.release();
                    }
                }, exec));
            }
            Map<Integer, BufferedImage> map = new TreeMap<>();
            for (CompletableFuture<Optional<IndexImg>> f : list) {
                f.join().ifPresent(v -> map.put(v.idx, v.img));
            }
            return map;
        }
    }

    private Optional<IndexImg> fetchWithRetry(HttpClient c, String prefix, int idx) {
        String url = prefix + "_" + idx + ".jpg";
        for (int t = 1; t <= MAX_RETRY; t++) {
            try {
                HttpRequest req = HttpRequest.newBuilder()
                                             .uri(URI.create(url))
                                             .timeout(TIMEOUT)
                                             .header("User-Agent", "Mozilla/5.0 Chrome/120 Safari/537.36")
                                             .header("Referer", prefix.replace("/seek/", "/"))
                                             .GET().build();
                HttpResponse<byte[]> r = c.send(req, HttpResponse.BodyHandlers.ofByteArray());
                if (r.statusCode() == 200) {
                    BufferedImage img = ImageIO.read(new ByteArrayInputStream(r.body()));
                    if (img != null) return Optional.of(new IndexImg(idx, img));
                } else if (r.statusCode() == 404) return Optional.empty();
            } catch (Exception ignored) { }
            try { Thread.sleep(300L * t); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }
        return Optional.empty();
    }

    /** 切割全部图片（每张仅取均匀的3帧） */
    private List<BufferedImage> sliceAll2(Map<Integer, BufferedImage> imgs) {
        List<BufferedImage> allTiles = new ArrayList<>();

        // ① 收集所有子帧
        for (var e : imgs.entrySet()) {
            BufferedImage im = e.getValue();
            int cols = im.getWidth() / TILE_W;
            int rows = im.getHeight() / TILE_H;

            for (int r = 0; r < rows && r < ROWS; r++) {
                for (int c = 0; c < cols && c < COLS; c++) {
                    allTiles.add(im.getSubimage(c * TILE_W, r * TILE_H, TILE_W, TILE_H));
                }
            }
        }

        // ② 均匀抽取
        int total = allTiles.size();
        List<BufferedImage> reduced = new ArrayList<>();
        for (int i = 0; i < total; i += 12) {
            reduced.add(allTiles.get(i));
        }
        return reduced;
    }

    /** 生成 GIF */
    private byte[] createGif(List<BufferedImage> frames, int delayCs) throws IOException {
        List<BufferedImage> scaled = frames.stream()
                                           .map(img -> {
                                               try {
                                                   return Thumbnails.of(img)
                                                                    .size(200, 112)
                                                                    .outputQuality(0.8)
                                                                    .asBufferedImage();
                                               } catch (IOException e) {
                                                   throw new RuntimeException(e);
                                               }
                                           })
                                           .toList();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
            ImageWriter w = ImageIO.getImageWritersBySuffix("gif").next();
            w.setOutput(ios);
            w.prepareWriteSequence(null);
            for (BufferedImage f : scaled) {
                IIOMetadata meta = meta(w, f, delayCs);
                w.writeToSequence(new IIOImage(f, null, meta), null);
            }
            w.endWriteSequence();
            ios.flush();
            return baos.toByteArray();
        }
    }

    private IIOMetadata meta(ImageWriter w, BufferedImage img, int d) throws IOException {
        ImageWriteParam p = w.getDefaultWriteParam();
        ImageTypeSpecifier s = ImageTypeSpecifier.createFromBufferedImageType(img.getType());
        IIOMetadata m = w.getDefaultImageMetadata(s, p);
        String name = m.getNativeMetadataFormatName();
        IIOMetadataNode root = new IIOMetadataNode(name);

        IIOMetadataNode gce = new IIOMetadataNode("GraphicControlExtension");
        gce.setAttribute("disposalMethod", "none");
        gce.setAttribute("userInputFlag", "FALSE");
        gce.setAttribute("transparentColorFlag", "FALSE");
        gce.setAttribute("delayTime", String.valueOf(d));
        gce.setAttribute("transparentColorIndex", "0");
        root.appendChild(gce);

        IIOMetadataNode app = new IIOMetadataNode("ApplicationExtensions");
        IIOMetadataNode ext = new IIOMetadataNode("ApplicationExtension");
        ext.setAttribute("applicationID", "NETSCAPE");
        ext.setAttribute("authenticationCode", "2.0");
        ext.setUserObject(new byte[]{1, 0, 0}); // 循环播放
        app.appendChild(ext);
        root.appendChild(app);

        m.mergeTree(name, root);
        return m;
    }

    private record IndexImg(int idx, BufferedImage img) {}
}

