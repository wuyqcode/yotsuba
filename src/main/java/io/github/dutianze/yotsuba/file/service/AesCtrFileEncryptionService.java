package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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


    private Path getEncryptedFilePath(FileResourceId fileResourceId) {
        return Paths.get(FILE_STORAGE_PATH, fileResourceId.id() + ".encrypted");
    }

    public void encryptFile(InputStream inputStream, FileResourceId fileResourceId, String password) throws Exception {
        Path encryptedFilePath = getEncryptedFilePath(fileResourceId);
        Files.createDirectories(encryptedFilePath.getParent());

        try (OutputStream out = createEncryptedOutputStream(encryptedFilePath, password)) {
            byte[] buffer = new byte[BUFFER_SIZE];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }

        log.info("Encrypted file {} as single encrypted file", fileResourceId.id());
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

    public InputStream decryptFile(FileResourceId fileResourceId, String password) throws Exception {
        Path encryptedFilePath = getEncryptedFilePath(fileResourceId);
        if (!Files.exists(encryptedFilePath)) {
            throw new IOException("Encrypted file not found: " + encryptedFilePath);
        }

        return createDecryptedInputStream(encryptedFilePath, password);
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

    public boolean deleteFile(FileResourceId fileResourceId) {
        try {
            Path encryptedFilePath = getEncryptedFilePath(fileResourceId);
            if (Files.exists(encryptedFilePath)) {
                Files.delete(encryptedFilePath);
                log.info("Deleted encrypted file: {}", encryptedFilePath);
                return true;
            }
        } catch (Exception e) {
            log.error("Failed to delete file: {}", fileResourceId.id(), e);
        }
        return false;
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
