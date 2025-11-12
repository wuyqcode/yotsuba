package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

@Endpoint
@AnonymousAllowed
public class WikiFetcher {

  private static final HttpClient client = HttpClient.newHttpClient();

  public static WikiPage fetch(String url) throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .header("User-Agent", "WikiFetcher/1.0 (Java 21)")
        .GET()
        .build();

    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(
        StandardCharsets.UTF_8));
    if (response.statusCode() != 200) {
      throw new IOException("Failed to fetch page: " + response.statusCode());
    }

    Document doc = Jsoup.parse(response.body());
    Element content = doc.selectFirst(".mw-content-ltr.mw-parser-output");
    String title = doc.selectFirst("#firstHeading") != null
        ? Objects.requireNonNull(doc.selectFirst("#firstHeading")).text()
        : "Untitled";

    return new WikiPage(title, content != null ? content.html() : "<p>No content found</p>");
  }

  public record WikiPage(String title, String content) {}
}
