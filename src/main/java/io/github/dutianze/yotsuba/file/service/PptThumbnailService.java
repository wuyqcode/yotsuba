package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.valueobject.StorageVersion;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PptThumbnailService implements ThumbnailService {

  private final AesCtrFileEncryptionService aesCtrFileEncryptionService;

  @Override
  public boolean supports(String filename) {
    return filename.endsWith(".pptx") || filename.endsWith(".ppt");
  }

  @Override
  public List<Integer> generateThumbnail(InputStream in, String id, String password, StorageVersion storageVersion)
      throws Exception {
    List<Integer> result = new ArrayList<>();
    try (XMLSlideShow ppt = new XMLSlideShow(in)) {
      Dimension pgsize = ppt.getPageSize();

      int index = 1;
      for (XSLFSlide slide : ppt.getSlides()) {
        double zoom = 2.0;
        int width = (int) (pgsize.width * zoom);
        int height = (int) (pgsize.height * zoom);

        BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = img.createGraphics();

        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
            RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING,
            RenderingHints.VALUE_RENDER_QUALITY);
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
            RenderingHints.VALUE_ANTIALIAS_ON);

        graphics.setPaint(Color.WHITE);
        graphics.fill(new Rectangle(0, 0, width, height));

        graphics.scale(zoom, zoom);
        slide.draw(graphics);

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", bos);
        byte[] pngBytes = bos.toByteArray();
        try (InputStream tin = new ByteArrayInputStream(pngBytes)) {
          aesCtrFileEncryptionService.encryptFile(tin, Path.of(id, String.valueOf(index)),
              password, storageVersion);
        }
        result.add(index);
        index++;
      }
    }
    return result;
  }
}
