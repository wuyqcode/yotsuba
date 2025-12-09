package io.github.dutianze.yotsuba.search;

import org.hibernate.search.backend.lucene.analysis.LuceneAnalysisConfigurationContext;
import org.hibernate.search.backend.lucene.analysis.LuceneAnalysisConfigurer;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CustomLuceneAnalysisConfigurer implements LuceneAnalysisConfigurer {

  @Override
  public void configure(LuceneAnalysisConfigurationContext context) {
    context.analyzer("japanese")
        .custom()
        .tokenizer("japanese");

    context.analyzer("chinese")
        .custom()
        .tokenizer("hmmChinese");

    context.analyzer("english")
        .custom()
        .tokenizer("standard")
        .tokenFilter("lowercase")
        .tokenFilter("snowballPorter")
        .param("language", "English")
        .tokenFilter("asciiFolding");

  }
}
