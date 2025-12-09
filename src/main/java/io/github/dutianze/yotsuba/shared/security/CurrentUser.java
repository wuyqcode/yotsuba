package io.github.dutianze.yotsuba.shared.security;

import com.vaadin.flow.server.VaadinResponse;
import com.vaadin.flow.server.VaadinServletRequest;
import com.vaadin.flow.spring.security.AuthenticationContext;
import io.github.dutianze.yotsuba.shared.domain.User;
import io.github.dutianze.yotsuba.shared.domain.UserRepository;
import jakarta.annotation.Nullable;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;
    private final AuthenticationContext authenticationContext;

    public Optional<User> get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Optional.empty();
        }

        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return userRepository.findByUsername(jwt.getSubject());
        }
        return Optional.empty();
    }

    public boolean isUserLoggedIn() {
        return this.isUserLoggedIn(SecurityContextHolder.getContext().getAuthentication());
    }

    private boolean isUserLoggedIn(@Nullable Authentication authentication) {
        return authentication != null && !(authentication instanceof AnonymousAuthenticationToken);
    }

    public void logout() {
        HttpServletRequest request = VaadinServletRequest.getCurrent().getHttpServletRequest();

        authenticationContext.logout();

        var cookie = new Cookie("remember-me", null);
        cookie.setMaxAge(0);
        cookie.setPath(
                StringUtils.hasLength(request.getContextPath()) ? request.getContextPath() : "/");

        HttpServletResponse response = (HttpServletResponse) VaadinResponse.getCurrent();
        response.addCookie(cookie);
    }

}
