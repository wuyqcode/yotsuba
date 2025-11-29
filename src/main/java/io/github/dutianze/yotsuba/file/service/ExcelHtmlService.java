package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.valueobject.StorageVersion;
import lombok.RequiredArgsConstructor;
import org.apache.poi.hssf.converter.ExcelToHtmlConverter;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ooxml.util.DocumentHelper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import java.io.*;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelHtmlService implements ThumbnailService {

  private final AesCtrFileEncryptionService aesCtrFileEncryptionService;

  @Override
  public boolean supports(String filename) {
    String lower = filename.toLowerCase();
    return lower.endsWith(".xlsx") || lower.endsWith(".xls");
  }

  @Override
  public List<Integer> generateThumbnail(InputStream in, String id, String password, StorageVersion storageVersion)
      throws Exception {

    in = new BufferedInputStream(in);
    in.mark(10);

    byte[] header = new byte[4];
    in.read(header);
    in.reset();

    boolean isXls = (header[0] == (byte) 0xD0 && header[1] == (byte) 0xCF);

    if (isXls) {
      return handleXls(in, id, password, storageVersion);
    } else {
      return handleXlsx(in, id, password, storageVersion);
    }
  }

  /** ========================
   *  XLS → HTML
   ========================= */
  private List<Integer> handleXls(InputStream in, String id, String password, StorageVersion storageVersion) throws Exception {
    List<Integer> result = new ArrayList<>();

    HSSFWorkbook workbook = new HSSFWorkbook(in);

    ExcelToHtmlConverter converter = new ExcelToHtmlConverter(
        DocumentHelper.createDocument()
    );
    converter.processWorkbook(workbook);

    org.w3c.dom.Document htmlDoc = converter.getDocument();

    ByteArrayOutputStream htmlOut = new ByteArrayOutputStream();

    Transformer serializer = TransformerFactory.newInstance().newTransformer();
    serializer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
    serializer.setOutputProperty(OutputKeys.METHOD, "html");
    serializer.setOutputProperty(OutputKeys.INDENT, "no");

    serializer.transform(new DOMSource(htmlDoc), new StreamResult(htmlOut));

    byte[] htmlBytes = htmlOut.toByteArray();

    try (InputStream tin = new ByteArrayInputStream(htmlBytes)) {
      aesCtrFileEncryptionService.encryptFile(tin, Path.of(id, "1"), password, storageVersion);
    }

    result.add(1);
    return result;
  }


  /** ========================
   *  XLSX → Very Simple HTML（POI 官方只能手写）
   ========================= */
  private List<Integer> handleXlsx(InputStream in, String id, String password, StorageVersion storageVersion) throws Exception {

    List<Integer> result = new ArrayList<>();
    XSSFWorkbook workbook = new XSSFWorkbook(in);

    for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
      Sheet sheet = workbook.getSheetAt(sheetIndex);

      StringBuilder sb = new StringBuilder();
      sb.append("<html><head><meta charset='UTF-8'></head><body>");
      sb.append("<table border='1' cellspacing='0' cellpadding='3'>");

      for (Row row : sheet) {
        sb.append("<tr>");
        for (Cell cell : row) {
          sb.append("<td>");
          sb.append(getCellValue(cell));
          sb.append("</td>");
        }
        sb.append("</tr>");
      }

      sb.append("</table></body></html>");

      byte[] htmlBytes = sb.toString().getBytes("UTF-8");

      try (InputStream tin = new ByteArrayInputStream(htmlBytes)) {
        aesCtrFileEncryptionService.encryptFile(
            tin,
            Path.of(id, String.valueOf(sheetIndex + 1)),
            password,
            storageVersion
        );
      }

      result.add(sheetIndex + 1);
    }

    return result;
  }


  private String getCellValue(Cell cell) {
    if (cell == null) {
      return "";
    }

    return switch (cell.getCellType()) {
      case STRING -> cell.getStringCellValue();
      case NUMERIC -> String.valueOf(cell.getNumericCellValue());
      case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
      case FORMULA -> cell.getCellFormula();
      default -> "";
    };
  }
}
