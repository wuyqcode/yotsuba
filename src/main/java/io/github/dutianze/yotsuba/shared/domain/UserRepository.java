package io.github.dutianze.yotsuba.shared.domain;

import io.github.dutianze.yotsuba.shared.domain.valueobject.UserId;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository extends JpaRepository<User, UserId>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);
}