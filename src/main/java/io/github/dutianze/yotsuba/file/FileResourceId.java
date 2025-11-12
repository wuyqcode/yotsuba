package io.github.dutianze.yotsuba.file;

import io.github.dutianze.yotsuba.shared.common.Constant;
import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import java.util.Objects;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.Assert;
import org.springframework.web.util.UriComponentsBuilder;

@Embeddable
public record FileResourceId(String id) {

  public FileResourceId {
    Assert.notNull(id, "id must not be null");
  }

  public FileResourceId() {
    this(TSID.Factory.getTsid().toString());
  }

  public static FileResourceId extractIdFromUrl(String url) {
    if (StringUtils.isBlank(url)) {
      return null;
    }
    String id = StringUtils.substringAfterLast(url, "/");
    if (StringUtils.isBlank(id)) {
      return null;
    }
    return new FileResourceId(id);
  }

  public String getUrl() {
    return UriComponentsBuilder.fromPath(Constant.FILE_RESOURCE_URL_PREFIX)
        .pathSegment(this.id)
        .build()
        .toUriString();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    FileResourceId that = (FileResourceId) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(id);
  }
}
