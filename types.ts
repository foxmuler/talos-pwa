
export type MovementOrigin = 'manual' | 'ocr';

export interface Movement {
    id: number;
    fechaISO: string;
    mesAño: string; // "YYYY-MM"
    importe: number;
    descripcion: string;
    origen: MovementOrigin;
    ocrConfianza?: number;
}

export interface Settings {
    id: 'default';
    inicialMensual: number;
    ocrConfidenceThreshold: number;
}

export type View = 'home' | 'history' | 'settings' | 'graph';

export interface AppError {
    code: string;
    message: string;
}