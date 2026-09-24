package com.bytepath.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.util.Matrix;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.rendering.PDFRenderer;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

@Service
public class DocumentProcessingService {
    private final String tesseractPath;
    public DocumentProcessingService(@Value("${tesseract.path:/usr/bin/tesseract}") String tesseractPath) { this.tesseractPath = tesseractPath; }

    public byte[] watermarkPdf(byte[] input, String watermark) {
        try (PDDocument doc = Loader.loadPDF(input); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            var font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            for (var page : doc.getPages()) {
                PDRectangle box = page.getMediaBox();
                try (PDPageContentStream stream = new PDPageContentStream(doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    float watermarkGray = 150f / 255f;
                    stream.setNonStrokingColor(watermarkGray, watermarkGray, watermarkGray);
                    stream.setFont(font, 8); stream.beginText();
                    stream.setTextMatrix(Matrix.getRotateInstance(Math.toRadians(35), box.getWidth() / 5, box.getHeight() / 2));
                    stream.showText(watermark); stream.endText();
                }
            }
            doc.save(out); return out.toByteArray();
        } catch (Exception ex) { throw new IllegalStateException("Could not watermark this PDF.", ex); }
    }

    public int pageCount(byte[] input) {
        try (PDDocument doc = Loader.loadPDF(input)) {
            return doc.getNumberOfPages();
        } catch (Exception ex) {
            throw new IllegalStateException("Could not read this PDF.", ex);
        }
    }

    /** Render one watermarked page so the browser never receives the source PDF. */
    public byte[] renderWatermarkedPage(byte[] input, int pageIndex, String watermark) {
        try (PDDocument doc = Loader.loadPDF(input); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            if (pageIndex < 0 || pageIndex >= doc.getNumberOfPages()) {
                throw new IllegalArgumentException("Requested page does not exist.");
            }
            var image = new PDFRenderer(doc).renderImageWithDPI(pageIndex, 150);
            Graphics2D graphics = image.createGraphics();
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            // Keep the watermark traceable but subtle enough that it does not
            // interfere with reading questions or diagrams.
            graphics.setColor(new Color(100, 100, 100, 42));
            graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 18));
            graphics.rotate(Math.toRadians(-32), image.getWidth() / 2.0, image.getHeight() / 2.0);
            int textWidth = graphics.getFontMetrics().stringWidth(watermark);
            graphics.drawString(watermark,
                (image.getWidth() - textWidth) / 2,
                image.getHeight() / 2);
            graphics.dispose();
            ImageIO.write(image, "png", out);
            return out.toByteArray();
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Could not render this PDF page.", ex);
        }
    }

    public String extractTextOrOcr(byte[] input) {
        try (PDDocument doc = Loader.loadPDF(input)) {
            String text = new PDFTextStripper().getText(doc).trim();
            if (!text.isBlank()) return text;
        } catch (Exception ignored) { }
        // Scanned-PDF OCR is delegated to the host Tesseract binary. The upload
        // path can persist this result or send it to the search index.
        try (PDDocument doc = Loader.loadPDF(input)) {
            Path dir = Files.createTempDirectory("bytepath-ocr-"); StringBuilder result = new StringBuilder();
            PDFRenderer renderer = new PDFRenderer(doc);
            for (int page = 0; page < doc.getNumberOfPages(); page++) {
                Path image = dir.resolve("page-" + page + ".png"); Path text = dir.resolve("page-" + page);
                ImageIO.write(renderer.renderImageWithDPI(page, 180), "png", image.toFile());
                Process process = new ProcessBuilder(tesseractPath, image.toString(), text.toString(), "txt").redirectErrorStream(true).start();
                process.waitFor(); Path output = Path.of(text + ".txt"); if (Files.exists(output)) result.append(Files.readString(output)).append('\n');
            }
            return result.toString().trim();
        } catch (Exception ex) { return ""; }
    }
}
