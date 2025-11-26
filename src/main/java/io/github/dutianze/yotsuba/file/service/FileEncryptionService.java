package io.github.dutianze.yotsuba.file.service;

import static org.apache.commons.io.IOUtils.readFully;

import java.io.EOFException;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigInteger;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Arrays;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@Service
public class FileEncryptionService {

  // ★ 改成 CTR，可随机访问
  private static final String CIPHER_ALGORITHM = "AES/CTR/NoPadding";
  private static final String KEY_DERIVATION_ALGORITHM = "PBKDF2WithHmacSHA256";

  private static final int ITERATION_COUNT = 65_536;
  private static final int KEY_LENGTH_BITS = 128;

  public static final int SALT_LENGTH = 16;
  public static final int IV_LENGTH = 16;
  private static final int BUFFER_SIZE = 8_192;
  private static final int BLOCK_SIZE = 16;

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private record FileHeader(byte[] salt, byte[] iv) {

  }

  public SecretKey generateKeyFromPassword(String password, byte[] salt)
      throws NoSuchAlgorithmException, InvalidKeySpecException {
    PBEKeySpec spec = new PBEKeySpec(
        password.toCharArray(),
        salt,
        ITERATION_COUNT,
        KEY_LENGTH_BITS
    );
    SecretKeyFactory keyFactory = SecretKeyFactory.getInstance(KEY_DERIVATION_ALGORITHM);
    byte[] keyBytes = keyFactory.generateSecret(spec).getEncoded();
    return new SecretKeySpec(keyBytes, "AES");
  }

  private static byte[] generateRandomBytes(int length) {
    byte[] bytes = new byte[length];
    SECURE_RANDOM.nextBytes(bytes);
    return bytes;
  }

  private static FileHeader readHeader(InputStream in) throws IOException {
    byte[] salt = readFully(in, SALT_LENGTH);
    byte[] iv = readFully(in, IV_LENGTH);

    if (salt.length != SALT_LENGTH || iv.length != IV_LENGTH) {
      throw new EOFException("Unexpected end of stream while reading encryption header");
    }

    return new FileHeader(salt, iv);
  }

  private static void writeHeader(OutputStream out, byte[] salt, byte[] iv) throws IOException {
    if (salt.length != SALT_LENGTH) {
      throw new IllegalArgumentException("Invalid salt length: " + salt.length);
    }
    if (iv.length != IV_LENGTH) {
      throw new IllegalArgumentException("Invalid IV length: " + iv.length);
    }
    out.write(salt);
    out.write(iv);
  }

  private static IvParameterSpec createCtrIv(byte[] baseIv, long blockCounter) {
    BigInteger ivInt = new BigInteger(1, baseIv);
    ivInt = ivInt.add(BigInteger.valueOf(blockCounter));

    byte[] newIv = ivInt.toByteArray();
    if (newIv.length > IV_LENGTH) {
      newIv = Arrays.copyOfRange(newIv, newIv.length - IV_LENGTH, newIv.length);
    } else if (newIv.length < IV_LENGTH) {
      byte[] padded = new byte[IV_LENGTH];
      System.arraycopy(newIv, 0, padded, IV_LENGTH - newIv.length, newIv.length);
      newIv = padded;
    }
    return new IvParameterSpec(newIv);
  }

  private static void skipFully(InputStream in, long toSkip) throws IOException {
    long remaining = toSkip;
    while (remaining > 0) {
      long skipped = in.skip(remaining);
      if (skipped <= 0) {
        throw new EOFException("Unable to skip required bytes");
      }
      remaining -= skipped;
    }
  }

  private static class BoundedInputStream extends FilterInputStream {

    private long remaining;

    protected BoundedInputStream(InputStream in, long remaining) {
      super(in);
      this.remaining = remaining;
    }

    @Override
    public int read() throws IOException {
      if (remaining <= 0) {
        return -1;
      }
      int b = super.read();
      if (b != -1) {
        remaining--;
      }
      return b;
    }

    @Override
    public int read(@NotNull byte[] b, int off, int len) throws IOException {
      if (remaining <= 0) {
        return -1;
      }
      if (len > remaining) {
        len = (int) remaining;
      }
      int count = super.read(b, off, len);
      if (count != -1) {
        remaining -= count;
      }
      return count;
    }
  }

  public void encryptFile(File inputFile, File outputFile, String password)
      throws Exception {
    try (FileInputStream fis = new FileInputStream(inputFile);
        OutputStream os = getEncryptedOutputStream(outputFile, password)) {
      byte[] buffer = new byte[BUFFER_SIZE];
      int bytesRead;
      while ((bytesRead = fis.read(buffer)) != -1) {
        os.write(buffer, 0, bytesRead);
      }
    }
  }

  public void decryptFile(File inputFile, File outputFile, String password)
      throws IOException,
      NoSuchAlgorithmException,
      InvalidKeySpecException,
      NoSuchPaddingException,
      InvalidAlgorithmParameterException,
      InvalidKeyException {

    try (FileInputStream fis = new FileInputStream(inputFile);
        FileOutputStream fos = new FileOutputStream(outputFile)) {

      FileHeader header = readHeader(fis);
      SecretKey secretKey = generateKeyFromPassword(password, header.salt);

      Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
      cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(header.iv));

      try (CipherInputStream cis = new CipherInputStream(fis, cipher)) {
        byte[] buffer = new byte[BUFFER_SIZE];
        int bytesRead;
        while ((bytesRead = cis.read(buffer)) != -1) {
          fos.write(buffer, 0, bytesRead);
        }
      }
    }
  }

  public InputStream getDecryptedInputStream(File inputFile, String password)
      throws Exception {

    FileInputStream fis = new FileInputStream(inputFile);
    try {
      FileHeader header = readHeader(fis);
      SecretKey secretKey = generateKeyFromPassword(password, header.salt);

      Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
      cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(header.iv));

      return new CipherInputStream(fis, cipher);
    } catch (Exception e) {
      try { fis.close(); } catch (IOException suppressed) { e.addSuppressed(suppressed); }
      throw e;
    }
  }


  public OutputStream getEncryptedOutputStream(File finalFile, String password)
      throws Exception {
    FileOutputStream fos = new FileOutputStream(finalFile, false);
    boolean success = false;
    try {
      byte[] salt = generateRandomBytes(SALT_LENGTH);
      byte[] iv = generateRandomBytes(IV_LENGTH);

      writeHeader(fos, salt, iv);
      SecretKey secretKey = generateKeyFromPassword(password, salt);

      Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
      cipher.init(Cipher.ENCRYPT_MODE, secretKey, new IvParameterSpec(iv));

      CipherOutputStream cos = new CipherOutputStream(fos, cipher);
      success = true;
      return cos;
    } finally {
      if (!success) {
        try {
          fos.close();
        } catch (IOException ignored) {
        }
      }
    }
  }

  /**
   * @param inputFile   加密文件（结构：salt(16) + iv(16) + ciphertext）
   * @param password    密码
   * @param plainStart  明文起始偏移（包含）
   * @param plainEnd    明文结束偏移（包含）
   */
  public InputStream openDecryptedRangeStream(File inputFile, String password,
      long plainStart, long plainEnd) throws Exception {
    if (plainStart < 0 || plainEnd < plainStart) {
      throw new IllegalArgumentException("Invalid range: " + plainStart + "-" + plainEnd);
    }

    FileInputStream fis = new FileInputStream(inputFile);
    try {
      FileHeader header = readHeader(fis);
      SecretKey secretKey = generateKeyFromPassword(password, header.salt);

      long length = inputFile.length();
      long headerLen = SALT_LENGTH + IV_LENGTH;
      long plainLength = length - headerLen;

      if (plainStart >= plainLength) {
        throw new IllegalArgumentException("Range start beyond file length");
      }
      if (plainEnd >= plainLength) {
        plainEnd = plainLength - 1;
      }

      long contentLength = plainEnd - plainStart + 1;

      long blockIndex = plainStart / BLOCK_SIZE;
      int offsetInBlock = (int) (plainStart % BLOCK_SIZE);

      IvParameterSpec ctrIv = createCtrIv(header.iv, blockIndex);

      long cipherOffset = blockIndex * BLOCK_SIZE;
      if (cipherOffset > 0) {
        skipFully(fis, cipherOffset);
      }

      Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
      cipher.init(Cipher.DECRYPT_MODE, secretKey, ctrIv);

      CipherInputStream cis = new CipherInputStream(fis, cipher);

      if (offsetInBlock > 0) {
        skipFully(cis, offsetInBlock);
      }

      return new BoundedInputStream(cis, contentLength);
    } catch (Exception e) {
      try {
        fis.close();
      } catch (IOException suppressed) {
        e.addSuppressed(suppressed);
      }
      throw e;
    }
  }

  public long getPlaintextSize(File encryptedFile) {
    long length = encryptedFile.length();
    long headerLen = SALT_LENGTH + IV_LENGTH;
    long cipherLength = length - headerLen;
    return Math.max(cipherLength, 0);
  }
}
