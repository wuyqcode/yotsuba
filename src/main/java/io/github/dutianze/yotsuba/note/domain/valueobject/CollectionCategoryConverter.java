package io.github.dutianze.yotsuba.note.domain.valueobject;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class CollectionCategoryConverter implements AttributeConverter<CollectionCategory, Integer> {

  @Override
  public Integer convertToDatabaseColumn(CollectionCategory attr) {
    return attr != null ? attr.getCode() : null;
  }

  @Override
  public CollectionCategory convertToEntityAttribute(Integer dbData) {
    return dbData != null ? CollectionCategory.fromCode(dbData) : null;
  }
}
