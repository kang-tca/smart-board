export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'pentagon';
export type Tool = 'select' | 'hand' | 'pen' | 'highlighter' | 'rectangle' | 'circle' | 'triangle' | 'pentagon' | 'sticker' | 'tag' | 'eraser' | 'text';
export type StickerType = 'like' | 'star' | 'smile' | 'question' | 'homework' | 'love';

export interface ToolOptions {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  stickerType: StickerType;
  stickerSize: number;
}

export interface Transform {
  scale: number;
  x: number;
  y: number;
}

export interface SaveMetadata {
  id: string;
  name: string;
  lastModified: number;
}

interface CanvasItemBase {
  id: string;
  x: number;
  y: number;
  zIndex: number;
  visible: boolean;
}

export interface ImageItem extends CanvasItemBase {
  type: 'image';
  width: number;
  height: number;
  dataUrl: string;
  isPdfPage?: boolean;
}

export interface PathItem extends CanvasItemBase {
  type: 'path';
  points: { x: number; y: number }[];
  strokeColor: string;
  strokeWidth: number;
  isHighlighter: boolean;
}

export interface ShapeItem extends CanvasItemBase {
  type: 'shape';
  shape: ShapeType;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
}

export interface TextItem extends CanvasItemBase {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  width: number;
  height: number;
}

export interface StickerItem extends CanvasItemBase {
  type: 'sticker';
  stickerType: StickerType;
  width: number;
  height: number;
  dataUrl: string;
}

export interface TagItem extends CanvasItemBase {
  type: 'tag';
  title: string;
}

export interface YoutubeItem extends CanvasItemBase {
  type: 'youtube';
  videoId: string;
  width: number;
  height: number;
}


export type CanvasItem = ImageItem | PathItem | ShapeItem | TextItem | StickerItem | TagItem | YoutubeItem;