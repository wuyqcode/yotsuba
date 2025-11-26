package io.github.dutianze.yotsuba.file.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import org.springframework.core.io.AbstractResource;

public class ReusableResource extends AbstractResource {

  private final byte[] data;

  public ReusableResource(InputStream decryptedStream) {
    this.data = readAll(decryptedStream);
  }

  public ReusableResource(byte[] data) {
    this.data = data;
  }

  private byte[] readAll(InputStream in) {
    try (in) {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      byte[] buf = new byte[8192];
      int n;
      while ((n = in.read(buf)) != -1) {
        baos.write(buf, 0, n);
      }
      return baos.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException("Failed reading decrypted stream", e);
    }
  }

  @Override
  public InputStream getInputStream() {
    return new ByteArrayInputStream(data);
  }

  @Override
  public long contentLength() {
    return data.length;
  }

  @Override
  public String getDescription() {
    return "ReusableResource (byte[])";
  }

  public byte[] getBytes() {
    return data;
  }
}

