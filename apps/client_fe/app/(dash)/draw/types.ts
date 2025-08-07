export type DrawingStage = "pencil" | "rect" | "circle" | "text";

export interface DrawingApi {
    undoLastShape: () => void;
    getShapeCount: () => number;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    updateStage: (stage: DrawingStage) => void;
}
