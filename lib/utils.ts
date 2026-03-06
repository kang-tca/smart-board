import React from 'react';
import * as pako from 'pako';
import { CanvasItem } from '../types';

// Helper to compress data string to base64 using pako
export const compressData = (data: string): string => {
    try {
        const jsonStr = data;
        const uint8Arr = new TextEncoder().encode(jsonStr);
        const compressed = pako.deflate(uint8Arr);
        return btoa(String.fromCharCode.apply(null, Array.from(compressed)));
    } catch (error) {
        console.error("Compression failed:", error);
        return btoa(data); // Fallback to basic base64 if compression fails
    }
};

// Helper to decompress base64 string to original data using pako
export const decompressData = (base64: string): string => {
    try {
        const binaryStr = atob(base64);
        const uint8Arr = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            uint8Arr[i] = binaryStr.charCodeAt(i);
        }
        const decompressed = pako.inflate(uint8Arr);
        return new TextDecoder().decode(decompressed);
    } catch (error) {
        console.error("Decompression failed, falling back to basic base64 decode:", error);
        return atob(base64);
    }
};

// This function validates and migrates data loaded from storage to ensure it's
// compatible with the current version of the application.
export const validateAndMigrateItems = (
    itemsData: any[] | null,
    statusSetter: React.Dispatch<React.SetStateAction<{ text: string; type: "success" | "error"; } | null>>
): CanvasItem[] => {
    if (!itemsData || !Array.isArray(itemsData)) {
        console.warn("Loaded itemsData is null or not an array. Recovering with empty array.");
        return [];
    }

    try {
        return itemsData.map(item => {
            // Basic validation
            if (!item.id || !item.type) {
                console.warn(`Invalid item found. Missing id or type. Skipping. Item data:`, item);
                throw new Error("Invalid item format in saved data."); // Force a fail to rely on catch block handling
            }

            // Migration logic for specific types (if needed in the future)
            // Example:
            // if (item.type === 'old_text_type') {
            //      return { ...item, type: 'text', textOptions: { ...item.oldOptions } }
            // }

            // Type narrowing and explicit casting after validation
            // We assume the data format is generally correct after passing basic checks,
            // but we could add more rigorous zod-like runtime validation here if needed for robustness.
            if (item.type === 'path' || item.type === 'eraser' || item.type === 'highlighter') {
                return item as CanvasItem; // PathItem
            } else if (item.type === 'text') {
                return item as CanvasItem; // TextItem
            } else if (item.type === 'shape') {
                return item as CanvasItem; // ShapeItem
            } else if (item.type === 'image') {
                return item as CanvasItem; // ImageItem
            } else if (item.type === 'note') {
                return item as CanvasItem; // NoteItem
            } else {
                console.warn(`Unknown item type '${item.type}' found. Preserving as generic CanvasItem.`);
                return item as CanvasItem; // Fallback
            }
        });

    } catch (e) {
        console.error("Error migrating/validating loaded canvas items:", e);
        statusSetter({ text: "데이터 형식 오류, 일부 데이터를 복구할 수 없습니다.", type: "error" });
        return []; // Or attempt to return only valid items if possible
    }
};

export const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
};
