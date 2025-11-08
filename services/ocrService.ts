
export interface OCRResult {
    amount: number;
    confidence: number;
}

// Mock de Tesseract.js para desarrollo
export const processReceiptImage = async (imageFile: File): Promise<OCRResult> => {
    console.log("Processing image with mock OCR:", imageFile.name);

    // Simula el tiempo de procesamiento de OCR
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Genera un resultado aleatorio
    const shouldSucceed = Math.random() > 0.2; // 80% de éxito

    if (!shouldSucceed) {
        return {
            amount: 0,
            confidence: Math.floor(Math.random() * 50), // Confianza baja
        };
    }

    const amount = parseFloat((Math.random() * 50 + 5).toFixed(2));
    const confidence = Math.floor(Math.random() * 30 + 70); // Confianza entre 70 y 100

    return { amount, confidence };
};