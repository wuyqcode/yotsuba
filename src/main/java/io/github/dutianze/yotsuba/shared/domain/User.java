package io.github.dutianze.yotsuba.shared.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.github.dutianze.yotsuba.note.domain.Collection;
import io.github.dutianze.yotsuba.shared.domain.valueobject.UserId;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "application_user")
@NoArgsConstructor
public class User {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private UserId userId;

    private String username;

    private String name;

    @OneToMany(mappedBy = "user")
    private List<Collection> collections = new ArrayList<>();

    @JsonIgnore
    private String hashedPassword;

    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.EAGER)
    private Set<Role> roles;

    private byte[] profilePicture;

    @Version
    private int version;
}