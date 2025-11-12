package io.github.dutianze.yotsuba.note.domain;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.util.List;

@Converter
public class JsonListConverter<T> implements AttributeConverter<List<T>, String> {

  private static final ObjectMapper MAPPER = new ObjectMapper();
  private final Class<T> elementType;

  public JsonListConverter(Class<T> elementType) {
    this.elementType = elementType;
  }

  @Override
  public String convertToDatabaseColumn(@Nullable List<T> attribute) {
    if (attribute == null) {
      return "[]";
    }
    try {
      return MAPPER.writeValueAsString(attribute);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize JSON list", e);
    }
  }

  @Override
  public List<T> convertToEntityAttribute(@Nullable String dbData) {
    if (dbData == null || dbData.isBlank()) {
      return List.of();
    }
    try {
      return MAPPER.readValue(dbData,
          MAPPER.getTypeFactory().constructCollectionType(List.class, elementType));
    } catch (IOException e) {
      throw new IllegalStateException("Failed to deserialize JSON list", e);
    }
  }
}
