package io.github.dutianze.yotsuba.shared.endpoint;

import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.shared.domain.User;
import io.github.dutianze.yotsuba.shared.domain.UserRepository;
import io.github.dutianze.yotsuba.shared.security.CurrentUser;
import io.github.dutianze.yotsuba.shared.security.UserDto;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Optional;

@Endpoint
@PermitAll
@RequiredArgsConstructor
public class UserEndpoint {

    private final CurrentUser currentUser;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Optional<UserDto> getAuthenticatedUser() {
        return currentUser.get().map(UserDto::from);
    }

    @Transactional
    public UserDto updateName(String newName) {
        User user = this.getCurrent();
        user.setName(newName);
        userRepository.save(user);
        return UserDto.from(user);
    }

    @Transactional
    public void changePassword(String oldPassword, String newPassword) {
        User user = this.getCurrent();
        if (!passwordEncoder.matches(oldPassword, user.getHashedPassword())) {
            throw new IllegalArgumentException("旧密码错误");
        }

        user.setHashedPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public UserDto updateProfilePicture(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("头像文件不能为空");
        }

        int targetSize = 256;

        BufferedImage original = ImageIO.read(file.getInputStream());
        if (original == null) {
            throw new IllegalArgumentException("无效图片文件");
        }

        int width = original.getWidth();
        int height = original.getHeight();

        int squareSide = Math.min(width, height);
        int x = (width - squareSide) / 2;
        int y = (height - squareSide) / 2;

        BufferedImage square = original.getSubimage(x, y, squareSide, squareSide);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Thumbnails.of(square)
                  .size(targetSize, targetSize)
                  .keepAspectRatio(true)
                  .outputFormat("png")
                  .outputQuality(1.0)
                  .toOutputStream(baos);

        byte[] processedImage = baos.toByteArray();

        // -------- 3) 保存到用户 --------
        User user = this.getCurrent();
        user.setProfilePicture(processedImage);
        userRepository.save(user);

        return UserDto.from(user);
    }


    private User getCurrent() {
        return currentUser.get()
                          .orElseThrow(() -> new UsernameNotFoundException("No user present."));
    }

}
