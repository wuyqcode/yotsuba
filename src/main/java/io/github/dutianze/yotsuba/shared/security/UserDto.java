package io.github.dutianze.yotsuba.shared.security;

import io.github.dutianze.yotsuba.shared.domain.Role;
import io.github.dutianze.yotsuba.shared.domain.User;
import jakarta.annotation.Nonnull;
import java.util.Set;

@Nonnull
public record UserDto(
        String id,
        String username,
        String name,
        Set<Role> roles,
        byte[] profilePicture,
        int version
) {

    public static UserDto from(User user) {
        return new UserDto(
                user.getUserId().id(),
                user.getUsername(),
                user.getName(),
                user.getRoles(),
                user.getProfilePicture(),
                user.getVersion()
        );
    }


}
