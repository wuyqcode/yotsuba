package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.domain.valueobject.StorageVersion;
import java.util.Comparator;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;


@Slf4j
@Service
public class AesCtrFileEncryptionService {

    private static final String FILE_STORAGE_PATH = "files";
    private static final int BUFFER_SIZE = 8192;
    private static final String CIPHER_ALGORITHM = "AES/CTR/NoPadding";
    private static final String KEY_DERIVATION_ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int IV_LENGTH = 16;
    private static final int SALT_LENGTH = 16;
    private static final int ITERATION_COUNT = 65_536;
    private static final int KEY_LENGTH_BITS = 256;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public void encryptFile(InputStream inputStream, Path path, String password, StorageVersion storageVersion) throws Exception {
        Path fullPath = getStoragePath(path, storageVersion);
        Files.createDirectories(fullPath.getParent());
        Path encryptedPath = fullPath.resolveSibling(fullPath.getFileName() + ".encrypted");

        try (OutputStream out = createEncryptedOutputStream(encryptedPath, password)) {
            byte[] buffer = new byte[BUFFER_SIZE];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }

        log.info("Encrypted file {} as single encrypted file", encryptedPath);
    }

    private OutputStream createEncryptedOutputStream(Path filePath, String password) throws Exception {
        FileOutputStream fos = new FileOutputStream(filePath.toFile(), false);

        try {
            // 生成随机 salt 和 IV
            byte[] salt = generateRandomBytes(SALT_LENGTH);
            byte[] iv = generateRandomBytes(IV_LENGTH);

            // 写入头部：salt + IV
            fos.write(salt);
            fos.write(iv);

            // 派生密钥并初始化加密器
            SecretKey secretKey = generateKeyFromPassword(password, salt);
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);

            return new CipherOutputStream(fos, cipher);
        } catch (Exception e) {
            try {
                fos.close();
            } catch (IOException ignored) {
            }
            throw e;
        }
    }

    public InputStream decryptFile(Path path, String password, StorageVersion storageVersion) throws Exception {
      Path encryptedPath = getStoragePath(path, storageVersion)
          .resolveSibling(path.getFileName() + ".encrypted");

        if (!Files.exists(encryptedPath)) {
            throw new IOException("Encrypted file not found: " + encryptedPath);
        }

        return createDecryptedInputStream(encryptedPath, password);
    }

    private InputStream createDecryptedInputStream(Path filePath, String password) throws Exception {
        FileInputStream fis = new FileInputStream(filePath.toFile());

        try {
            // 读取头部：salt + IV
            byte[] salt = new byte[SALT_LENGTH];
            byte[] iv = new byte[IV_LENGTH];

            if (fis.read(salt) != SALT_LENGTH || fis.read(iv) != IV_LENGTH) {
                fis.close();
                throw new IOException("Failed to read file header");
            }

            // 派生密钥并初始化解密器
            SecretKey secretKey = generateKeyFromPassword(password, salt);
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);

            return new CipherInputStream(fis, cipher);
        } catch (Exception e) {
            try {
                fis.close();
            } catch (IOException suppressed) {
                e.addSuppressed(suppressed);
            }
            throw e;
        }
    }

    public boolean deleteFile(FileResourceId fileResourceId, StorageVersion storageVersion) {
        try {
            boolean deleted = false;
            Path encryptedFilePath = getEncryptedFilePath(fileResourceId, storageVersion);
            Path dirPath = encryptedFilePath.getParent().resolve(fileResourceId.id());
            if (Files.exists(encryptedFilePath)) {
                Files.delete(encryptedFilePath);
                log.info("Deleted encrypted file: {}", encryptedFilePath);
                deleted = true;
            }
            if (Files.exists(dirPath) && Files.isDirectory(dirPath)) {
                try (Stream<Path> paths = Files.walk(dirPath)) {
                    paths.sorted(Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                                log.info("Deleted: {}", path);
                            } catch (Exception ex) {
                                log.error("Failed to delete {}", path, ex);
                            }
                        });
                }
                deleted = true;
            }
            return deleted;
        } catch (Exception e) {
            log.error("Failed to delete file: {}", fileResourceId.id(), e);
        return false;
    }
    }

    private Path getEncryptedFilePath(FileResourceId fileResourceId, StorageVersion storageVersion) {
        return getStoragePath(Path.of(fileResourceId.id()), storageVersion)
            .resolveSibling(fileResourceId.id() + ".encrypted");
    }

    private Path getStoragePath(Path path, StorageVersion storageVersion) {
        if (storageVersion == StorageVersion.V2) {
            // 获取路径的第一部分（文件ID）
            Path firstPart = path.getName(0);
            String id = firstPart.toString();
            if (id != null && !id.isEmpty()) {
                String firstChar = id.substring(0, 1);
                // 构建路径：files/第一个字符/完整路径
                Path basePath = Path.of(FILE_STORAGE_PATH, firstChar);
                // 如果路径有多个部分，保留剩余部分
                if (path.getNameCount() > 1) {
                    return basePath.resolve(path);
                } else {
                    return basePath.resolve(id);
                }
            }
        } else if (storageVersion == StorageVersion.V3) {
            // 获取路径的第一部分（文件ID）
            Path firstPart = path.getName(0);
            String id = firstPart.toString();
            if (id != null && !id.isEmpty()) {
                // 使用前4个字符作为目录
                String prefix = id.length() >= 4 ? id.substring(0, 4) : id;
                // 构建路径：files/前4个字符/完整路径
                Path basePath = Path.of(FILE_STORAGE_PATH, prefix);
                // 如果路径有多个部分，保留剩余部分
                if (path.getNameCount() > 1) {
                    return basePath.resolve(path);
                } else {
                    return basePath.resolve(id);
                }
            }
        }
        return Path.of(FILE_STORAGE_PATH).resolve(path);
    }

    private SecretKey generateKeyFromPassword(String password, byte[] salt)
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
}
