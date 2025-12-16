
import * as pdfjsLib from 'pdfjs-dist';
// Vite-specific worker import
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        if (!fullText || fullText.trim().length < 10) {
            throw new Error("PDF_TEXT_EMPTY");
        }

        return fullText;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        if (error.message === "PDF_TEXT_EMPTY") throw error; // Re-throw specific error
        throw new Error("Failed to parse PDF");
    }
};
