package io.github.dutianze.yotsuba;

import net.coobird.thumbnailator.Thumbnails;

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
 * 运行:
 *   java SpriteSeekToGif https://surrit.com/.../seek/ 0 100 output.gif 0.1
 */
public class SpriteSeekToGif {

    private static final int TILE_W = 300;
    private static final int TILE_H = 168;
    private static final int COLS = 6, ROWS = 6;
    private static final int MAX_RETRY = 3;
    private static final int MAX_CONCURRENT = 30;
    private static final Duration TIMEOUT = Duration.ofSeconds(15);

    public static void main(String[] args) throws Exception {
        // 👇 你只需要改这一行
        String input = "xxx/seek 0 100";

        // 解析输入
        String[] parts = input.trim().split("\\s+");
        if (parts.length < 3) {
            System.out.println("输入格式错误，应为：<seekPrefix> <start> <end>");
            return;
        }

        String seekPrefix = parts[0];
        if (!seekPrefix.endsWith("/")) seekPrefix += "/";
        int start = Integer.parseInt(parts[1]);
        int end = Integer.parseInt(parts[2]);

        // 输出文件名自动生成（同目录下）
        String output = "output.gif";

        System.out.printf("解析成功:\nURL=%s\nstart=%d\nend=%d\n输出=%s\n\n",
                          seekPrefix, start, end, output);

        SpriteSeekToGif app = new SpriteSeekToGif();
        Map<Integer, BufferedImage> imgs = app.downloadRange(seekPrefix, start, end);
        List<BufferedImage> allTiles = app.sliceAll2(imgs);
        app.createGif(allTiles, output, 10);

        System.out.println("✅ 完成，输出 " + output);
    }

    /** 并发下载 */
    public Map<Integer, BufferedImage> downloadRange(String prefix, int start, int end) throws Exception {
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
                        String url = prefix + "_" + idx + ".jpg";
                        System.out.printf("⏳ [%03d] 下载开始：%s%n", idx, url);
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
            System.out.println("📸 下载成功: " + map.size());
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

    /** 切割全部图片 */
    public List<BufferedImage> sliceAll(Map<Integer, BufferedImage> imgs) {
        List<BufferedImage> tiles = new ArrayList<>();
        for (var e : imgs.entrySet()) {
            BufferedImage im = e.getValue();
            int cols = im.getWidth() / TILE_W;
            int rows = im.getHeight() / TILE_H;
            for (int r = 0; r < rows && r < ROWS; r++)
                for (int c = 0; c < cols && c < COLS; c++)
                    tiles.add(im.getSubimage(c * TILE_W, r * TILE_H, TILE_W, TILE_H));
        }
        System.out.println("✂️ 共切出 " + tiles.size() + " 帧");
        return tiles;
    }

    /** 切割全部图片（每张仅取均匀的3帧） */
    public List<BufferedImage> sliceAll2(Map<Integer, BufferedImage> imgs) {
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


        System.out.println("✂️ 原始帧总数: " + allTiles.size());

        // ② 均匀抽取
        int total = allTiles.size();

        List<BufferedImage> reduced = new ArrayList<>();
        for (int i = 0; i < total; i += 12) {
            reduced.add(allTiles.get(i));
        }

        System.out.println("🎯 均匀取样后帧数: " + reduced.size());
        return reduced;
    }


    /** 生成 GIF */
    public void createGif(List<BufferedImage> frames, String out, int delayCs) throws IOException {
        List<BufferedImage> scaled = frames.stream()
                                           .map(img -> {
                                               try {
                                                   return Thumbnails.of(img)
                                                                    .size(200, 112)   // 可调整大小
                                                                    .outputQuality(0.8)
                                                                    .asBufferedImage();
                                               } catch (IOException e) {
                                                   throw new RuntimeException(e);
                                               }
                                           })
                                           .toList();

        try (ImageOutputStream ios = new FileImageOutputStream(new File(out))) {
            ImageWriter w = ImageIO.getImageWritersBySuffix("gif").next();
            w.setOutput(ios);
            w.prepareWriteSequence(null);
            for (BufferedImage f : scaled) {
                IIOMetadata meta = meta(w, f, delayCs);
                w.writeToSequence(new IIOImage(f, null, meta), null);
            }
            w.endWriteSequence();
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
