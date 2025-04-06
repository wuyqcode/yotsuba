package io.github.dutianze.yotsuba.shared.data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.github.dutianze.yotsuba.shared.common.Tsid;
import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "application_user")
public class User {

    @Tsid
    @Id
    private String id;

    private String username;

    private String name;

    @JsonIgnore
    private String hashedPassword;

    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.EAGER)
    private Set<Role> roles;

    private byte[] profilePicture;

    @Version
    private int version;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public byte[] getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }

}
