import { createContext, useContext } from 'react';

export type DrawingStage = "pencil" | "rect" | "circle" | "text"|"";

interface DrawingContextType {
    stage: DrawingStage;
    setStage: (stage: DrawingStage) => void;
}

export const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export function useDrawingContext() {
    const context = useContext(DrawingContext);
    if (!context) {
        throw new Error('useDrawingContext must be used within a DrawingContextProvider');
    }
    return context;
}
