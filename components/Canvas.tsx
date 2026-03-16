
import React, { useRef, useEffect, useState, useCallback, Fragment } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // 오류를 유발하는 라이브러리 제거
import { CanvasItem, Tool, ToolOptions, PathItem, ShapeItem, Transform, TextItem, ShapeType, ImageItem, TagItem, StickerItem, StickerType } from '../types';
import { Icon } from './Icon';

interface CanvasProps {
    items: CanvasItem[];
    setItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
    selectedTool: Tool;
    toolOptions: ToolOptions;
    transform: Transform;
    setTransform: React.Dispatch<React.SetStateAction<Transform>>;
    selectedItemIds: string[];
    setSelectedItemIds: React.Dispatch<React.SetStateAction<string[]>>;
    undo: () => void;
    redo: () => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    backgroundColors: { name: string; color: string; }[];
    onEnterPresentation: (item: ImageItem) => void;
    isPresentationMode: boolean;
    presentationFitTransform: Transform | null;
    gridOpacity: number;
    setGridOpacity: (opacity: number) => void;
    onYoutubePlay?: (videoId: string) => void;
    isMultiTouchEnabled?: boolean;
}

const TAG_ICON_SIZE = 32; // in world units

// Helper functions for touch geometry
const getPointersDistance = (pointers: { clientX: number, clientY: number }[]) => {
    const p1 = pointers[0];
    const p2 = pointers[1];
    return Math.sqrt(Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2));
};

const getPointersMidpoint = (pointers: { clientX: number, clientY: number }[], rect: DOMRect) => {
    const p1 = pointers[0];
    const p2 = pointers[1];
    return {
        x: (p1.clientX + p2.clientX) / 2 - rect.left,
        y: (p1.clientY + p2.clientY) / 2 - rect.top
    };
};

// 안전한 ID 생성 함수 (uuid 라이브러리 대체)
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Helper to check if a color is dark (to set grid color)
const isDarkColor = (hex: string): boolean => {
    const c = hex.substring(1); // strip #
    const rgb = parseInt(c, 16);   // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >> 8) & 0xff;  // extract green
    const b = (rgb >> 0) & 0xff;  // extract blue
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma < 128;
};

// Duplicating SVGs here to avoid creating new files and to keep component logic contained.
const stickerSvgs: Record<StickerType, string> = {
    'like': `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve"><style>.st1{fill:#edf3fc}.st3{fill:#ffbe1b}.st10{fill:#5d8ef9}</style><path class="st1" d="M255.999 40.928c-118.778 0-215.071 96.294-215.071 215.074 0 118.776 96.292 215.068 215.071 215.068S471.07 374.778 471.07 256.002c0-118.78-96.293-215.074-215.071-215.074z"/><path class="st1" d="M255.999 1C115.391 1 1 115.392 1 256.002 1 396.609 115.391 511 255.999 511S511 396.609 511 256.002C511 115.392 396.607 1 255.999 1zm0 501.832c-136.103 0-246.83-110.728-246.83-246.83 0-136.104 110.727-246.833 246.83-246.833 136.102 0 246.832 110.729 246.832 246.833 0 136.102-110.73 246.83-246.832 246.83z"/><path d="M381.407 207.456h-81.964c-9.08 0-10.778-7.191-7.534-16.765 3.198-9.442 6.567-21.166 6.567-35.865 0-18.414-10.757-41.97-28.877-41.97-11.236 0-7.264 32.144-22.979 66.615-8.754 19.201-31.548 51.729-41.031 60.3v96.463c4.617 7.395 17.269 23.91 38.191 23.91 19.279 0 106.609-.065 106.609-.065 27.754 0 28.066-34.917 9.716-37.921l4.978.175c17.566-1.894 24.937-33.098 2.472-38.779l4.189-.076c16.783-1.763 24.489-31.634 1.11-38.294l5.55-.562c24.931-.35 26.578-37.101 3.003-37.166z" style="fill:#8ac9f9"/><path class="st3" d="M205.588 230.008v118.035c0 6.687-5.429 12.102-12.103 12.102H148.35c-6.688 0-12.102-5.415-12.102-12.102V230.008c0-6.673 5.414-12.103 12.102-12.103h45.135c6.674 0 12.103 5.43 12.103 12.103z"/><circle cx="183.037" cy="241.202" r="9.263" style="fill:#fff"/><path class="st3" d="M134.72 197.438a25.003 25.003 0 0 1-18.176-18.173l-.38-1.527-.385 1.527a24.997 24.997 0 0 1-18.173 18.173l-1.528.384 1.528.385a24.995 24.995 0 0 1 18.173 18.171l.385 1.526.38-1.526a25.002 25.002 0 0 1 18.176-18.171l1.528-.385-1.528-.384zM204.324 156.354a37.72 37.72 0 0 1-27.42-27.417l-.573-2.304-.58 2.304a37.71 37.71 0 0 1-27.417 27.417l-2.304.58 2.304.58a37.709 37.709 0 0 1 27.417 27.414l.58 2.303.573-2.303a37.72 37.72 0 0 1 27.42-27.414l2.305-.58-2.305-.58z"/><path class="st10" d="M287.335 400.495a35.794 35.794 0 0 1-26.02-26.017l-.543-2.186-.551 2.186a35.784 35.784 0 0 1-26.017 26.017l-2.187.55 2.187.55a35.785 35.785 0 0 1 26.017 26.014l.551 2.185.543-2.185a35.795 35.795 0 0 1 26.02-26.014l2.187-.55-2.187-.55z"/><path d="M385.9 157.943a34.217 34.217 0 0 1-24.874-24.87l-.52-2.09-.526 2.09a34.205 34.205 0 0 1-24.87 24.87l-2.09.526 2.09.526a34.205 34.205 0 0 1 24.87 24.867l.526 2.089.52-2.089a34.216 34.216 0 0 1 24.874-24.867l2.091-.526-2.091-.526z" style="fill:#330d84"/><g><path class="st10" d="M332.038 385.9a16.082 16.082 0 0 1-11.69-11.689l-.244-.982-.247.982a16.077 16.077 0 0 1-11.689 11.689l-.983.247.983.248a16.076 16.076 0 0 1 11.689 11.688l.247.981.244-.981a16.082 16.082 0 0 1 11.69-11.688l.983-.248-.983-.247z"/></g></svg>`,
    'star': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><circle fill="#FFE352" cx="256" cy="256" r="246"/><circle fill="#FFB236" cx="256" cy="256" r="200"/><path fill="#FFE352" d="m256 85.777 50.061 101.434L418 203.477l-81 78.956 19.121 111.486L256 341.282l-100.122 52.637L175 282.433l-81-78.956 111.939-16.266z"/></svg>`,
    'smile': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><style>.cls-2{fill:#273941}.cls-3{fill:#141e21}.cls-4{fill:#f6fafd}</style></defs><g id="_02-smile" data-name="02-smile"><circle cx="24" cy="24" r="23" style="fill:#ffce52"/><ellipse class="cls-2" cx="33" cy="18" rx="3" ry="4"/><ellipse class="cls-2" cx="15" cy="18" rx="3" ry="4"/><ellipse class="cls-3" cx="33" cy="18" rx="2" ry="3"/><ellipse class="cls-3" cx="15" cy="18" rx="2" ry="3"/><circle class="cls-4" cx="34" cy="17" r="1"/><circle class="cls-4" cx="16" cy="17" r="1"/><path class="cls-2" d="M24 39c-7.72 0-14-5.832-14-13h2c0 6.065 5.383 11 12 11s12-4.935 12-11h2c0 7.168-6.28 13-14 13z"/><path d="M24 4c12.15 0 22 8.507 22 19h.975a23 23 0 0 0-45.95 0H2C2 12.507 11.85 4 24 4z" style="fill:#ffe369"/><path d="M46 23c0 10.493-9.85 19-22 19S2 33.493 2 23h-.975c-.014.332-.025.665-.025 1a23 23 0 0 0 46 0c0-.335-.011-.668-.025-1z" style="fill:#ffb32b"/><ellipse class="cls-4" cx="37" cy="9" rx=".825" ry="1.148" transform="rotate(-45.02 37 9)"/><ellipse class="cls-4" cx="30.746" cy="4.5" rx=".413" ry=".574" transform="rotate(-45.02 30.745 4.5)"/><ellipse class="cls-4" cx="34" cy="7" rx="1.65" ry="2.297" transform="rotate(-45.02 34 7)"/></g></svg>`,
    'question': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><circle fill="#6E83B7" cx="256" cy="256" r="246"/><circle fill="#466089" cx="256" cy="256" r="200"/><g><path fill="#EDEFF1" d="M276.02 351h-40v-89.36c0-23.401 19.097-42.439 42.571-42.439 20.087 0 36.429-16.194 36.429-36.101 0-19.905-16.342-36.1-36.429-36.1h-45.143c-20.087 0-36.429 16.194-36.429 36.1h-40c0-41.962 34.286-76.1 76.429-76.1h45.143c42.143 0 76.429 34.138 76.429 76.1s-34.286 76.1-76.429 76.1c-1.418 0-2.571 1.095-2.571 2.439V351z"/><circle fill="#EDEFF1" cx="256" cy="395" r="26"/></g></svg>`,
    'homework': `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64"><defs><linearGradient id="linear-gradient" x1="32" y1="57.02" x2="32" y2="19" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#54a5ff"/><stop offset="1" stop-color="#8ad3fe"/></linearGradient><linearGradient id="linear-gradient-2" x1="11" y1="34.5" x2="32" y2="34.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d3e6f5"/><stop offset="1" stop-color="#f0f7fc"/></linearGradient><linearGradient id="linear-gradient-3" x1="32" x2="53" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-4" x1="43" y1="40" x2="43" y2="7" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fe9661"/><stop offset="1" stop-color="#ffb369"/></linearGradient><style>.cls-4{fill:#b4cde1}</style></defs><g id="Homework"><path d="M53 19h2a2 2 0 0 1 2 2v31a2 2 0 0 1-2 2H38.8a3.36 3.36 0 0 0-2.8 1.5c-1.2 1.82-3 1.5-5.2 1.5-3.07 0-2.53-3-5.6-3H9a2 2 0 0 1-2-2V21a2 2 0 0 1 2-2h2" style="fill:url(#linear-gradient)"/><path d="M32 19v34a6.75 6.75 0 0 0-5.61-3H13a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2h13.39A6.75 6.75 0 0 1 32 19z" style="fill:url(#linear-gradient-2)"/><path d="M46 16h5a2 2 0 0 1 2 2v30a2 2 0 0 1-2 2H37.61A6.75 6.75 0 0 0 32 53V19c2.17-3.25 5.17-3 8-3" style="fill:url(#linear-gradient-3)"/><path class="cls-4" d="M27 44h-1v-5a1 1 0 0 0-2 0v5h-2v-6a1 1 0 0 0-2 0v6h-2v-3a1 1 0 0 0-2 0v3h-1a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2zM27 23h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2zM27 28H16a1 1 0 0 1 0-2h11a1 1 0 0 1 0 2zM25 33h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2z"/><path d="m46 35-3 5-3-5V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2z" style="fill:url(#linear-gradient-4)"/><path class="cls-4" d="M46 35a5 5 0 0 0-6 0l3 5z"/><path style="fill:#eb7f58" d="M40 14h6v4h-6z"/></g></svg>`,
    'love': `<svg id="_50" data-name="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-4{fill:#fb626e}.cls-5{fill:#eea47d}.cls-7{fill:#f3c3b1}.cls-8{fill:#f5b890}</style></defs><circle cx="256" cy="256" r="256" style="fill:#f9eaa5"/><path d="M403 288.18 273.19 418a24.3 24.3 0 0 1-34.38 0L131.06 310.27 109 288.18a88.35 88.35 0 1 1 124.92-124.94l22.08 22.1 22.09-22.1A88.34 88.34 0 0 1 403 288.18z" style="fill:#e52e44"/><path d="M403 288.18 297.84 393.36a24.29 24.29 0 0 1-34.37 0L155.72 285.62l-22.09-22.09a88.36 88.36 0 0 1-11.1-111.4 88.4 88.4 0 0 1 111.39 11.11l22.08 22.1 22.09-22.1A88.34 88.34 0 0 1 403 288.18z" style="fill:#fa4654"/><ellipse class="cls-4" cx="368.47" cy="178.93" rx="22.41" ry="37.05" transform="rotate(-53.45 368.434 178.932)"/><ellipse class="cls-4" cx="403.74" cy="233.05" rx="14.16" ry="23.41" transform="rotate(-8.45 403.49 232.943)"/><path class="cls-5" d="M393.4 366.25a8.43 8.43 0 0 1-.66.71l-.25.25c-6.81 6.83-12.71 13.39-18 19.66-38.32 45.3-45.38 75.06-138.76 75.06-55.23 0-64.4 6.59-76 31.33-3.64-1.48-7.23-3-10.78-4.68a255 255 0 0 1-49.58-30.12q-6.4-4.95-12.48-10.31l48.34-48.33c63.75-63.74 84.9-50.57 96.35-50.57 6 0 14.93-5.47 22.17-10.73 6.69-4.84 11.9-9.5 11.9-9.5 3.62-3.62 7-5.55 9.92-6.19 8-1.74 13 6 12.09 14.83a22.42 22.42 0 0 1-6.56 13.62c-5.72 5.71-48.38 31-48.38 31h63.94c23.36 0 43.27-52.06 65.49-52.06 11.61 0 17.15 2.93 19.79 5.73a8 8 0 0 1 2.42 5l-2.6 3.05-.08.09-.31.38-.08.1-8.29 9.91h.31c1.91.13 12.07.92 17.81 3.69 3.66 1.83 5.51 4.36 2.28 8.08z"/><path d="m390.44 364.93-1.31-.53h-.06c-.73-.29-1.45-.56-2.14-.82l-.26-.1c-2.07-.75-3.84-1.32-5-1.7-5.74-1.95-13.28-1.14-13.28-1.14l4.7-5.85.21-.26 7.72-9.6.07-.1.18-.23.08-.1.31-.38c-.59-.47-1.33-1.08-2.2-1.65a12.18 12.18 0 0 0-2-1.09 9.35 9.35 0 0 0-3.65-.75c-22.21 0-45.86 56.55-69.22 56.55h-63.98s12.23-7.25 24.48-14.86h-32.41s42.66-25.26 48.38-31a22.42 22.42 0 0 0 6.56-13.62c-3.75-.85-8.61.74-14.09 6.22 0 0-22.62 20.23-34.07 20.23s-32.6-13.17-96.34 50.56l-43.79 43.75a255 255 0 0 0 49.58 30.12c3.55 1.65 7.14 3.2 10.78 4.68 11.63-24.74 20.8-31.33 76-31.33 93.38 0 100.44-29.76 138.76-75.06 5.3-6.27 11.2-12.83 18-19.66l.25-.25a8.43 8.43 0 0 0 .66-.71c3.25-3.72 1.4-6.25-2.24-8.07z" style="fill:#d48d77"/><path class="cls-5" d="M391.14 358.18c-.86 1.07-1.75 2.19-2.67 3.38l-1.52 2q-8.28 10.69-15.7 19.79c-52 63.69-75.41 71.07-118.15 71.07-82.45 0-92 5.24-104.17 34.16 3.55 1.65 7.14 3.2 10.78 4.68 11.63-24.74 20.8-31.33 76-31.33 93.38 0 100.44-29.76 138.76-75.06 5.3-6.27 11.2-12.83 18-19.66l.25-.25a8.43 8.43 0 0 0 .66-.71c3.25-3.72 1.4-6.25-2.24-8.07z"/><path class="cls-5" d="m384.32 340.91-2.55 3.09-.39.47-.08.1-8.22 9.92-8.25 9.95-26.52 32c-12.11 12.11-24.25 26-43.37 26 0 0 31.63-14.34 45.19-33.68 5.41-7.71 13.53-18.13 21.36-27.87l.42-.51c5.49-6.83 10.79-13.28 14.85-18.19l.39-.48.26-.32c1.8-2.17 3.33-4 4.49-5.39a8 8 0 0 1 2.42 4.91z"/><path class="cls-7" d="m274.54 335.31-5.2 5.2a9.65 9.65 0 0 1-13.65 0l-1.78-1.78-.2-.21c6.69-4.84 11.9-9.5 11.9-9.5 3.62-3.62 7-5.55 9.92-6.19a9.65 9.65 0 0 1-.99 12.48z"/><path class="cls-8" d="M382.07 344.27a9.65 9.65 0 0 0-13.65 0l-5.2 5.19c-3.77 3.77-4.65 10.47 1.62 15z"/><path class="cls-7" d="M381.77 344a9.57 9.57 0 0 0-4.63-2.37l-15.65 19.18a8.21 8.21 0 0 0 3.35 3.62z"/><path class="cls-8" d="M392.49 367.21c-6.81 6.83-12.71 13.39-18 19.66l-.21-.2-1.78-1.78a4.61 4.61 0 0 1-.37-.4q-.31-.35-.6-.72l-.29-.42a9.66 9.66 0 0 1 1.26-12.11l5.19-5.2a9.66 9.66 0 0 1 9-2.58l.28.07a9.74 9.74 0 0 1 2.16.86l.14.08a8.73 8.73 0 0 1 .94.6l.2.16.34.26.22.2.36.34z"/><path class="cls-7" d="M392.49 367.21c-6.81 6.83-12.71 13.39-18 19.66l-.21-.2-1.78-1.78a4.61 4.61 0 0 1-.37-.4q-.31-.35-.6-.72l-.29-.42q7.44-9.11 15.7-19.79a9.37 9.37 0 0 1 2.12.84h.05l.15.08a10.61 10.61 0 0 1 .94.6l.2.16.34.26.22.2.36.34z"/></svg>`,
};

const encodeSvg = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const CURSOR_SVGS = {
    pen: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`),
    highlighter: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 4.36a3.18 3.18 0 0 1 4.5 4.5L11.5 20.22 3.78 20.22 3.78 12.5 18.36 4.36z"></path><path d="M3.78 12.5L11.5 20.22"></path><path d="M8 8l8 8"></path></svg>`),
    eraser: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16a2.828 2.828 0 0 1 0-4L13 2a2.828 2.828 0 0 1 4 0L22 7a2.828 2.828 0 0 1 0 4L11 20"></path><path d="M6 13l5 5"></path></svg>`),
    text: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`)
};

const measureMultilineText = (
    ctx: CanvasRenderingContext2D,
    item: { text: string; fontSize: number; fontFamily: string; isBold: boolean; isItalic: boolean }
) => {
    const fontStyle = `${item.isItalic ? 'italic ' : ''}${item.isBold ? 'bold ' : ''}${item.fontSize}px ${item.fontFamily}`;
    ctx.font = fontStyle;
    const lines = item.text.split('\n');
    let maxWidth = 0;
    lines.forEach(line => {
        const metrics = ctx.measureText(line);
        if (metrics.width > maxWidth) {
            maxWidth = metrics.width;
        }
    });
    const lineHeight = item.fontSize * 1.2;
    const height = lines.length * lineHeight;
    return { width: maxWidth, height, lines, lineHeight };
};


// Helper for eraser intersection check
const lineSegmentIntersectsAABB = (p1: { x: number, y: number }, p2: { x: number, y: number }, bb: { x: number, y: number, width: number, height: number }) => {
    const orientation = (p: { x: number, y: number }, q: { x: number, y: number }, r: { x: number, y: number }) => {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0; // Collinear
        return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
    };
    const onSegment = (p: { x: number, y: number }, q: { x: number, y: number }, r: { x: number, y: number }) => {
        return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
    };
    const segmentsIntersect = (p1: { x: number, y: number }, q1: { x: number, y: number }, p2: { x: number, y: number }, q2: { x: number, y: number }) => {
        const o1 = orientation(p1, q1, p2);
        const o2 = orientation(p1, q1, q2);
        const o3 = orientation(p2, q2, p1);
        const o4 = orientation(p2, q2, q1);
        if (o1 !== o2 && o3 !== o4) return true;
        if (o1 === 0 && onSegment(p1, p2, q1)) return true;
        if (o2 === 0 && onSegment(p1, q2, q1)) return true;
        if (o3 === 0 && onSegment(p2, p1, q2)) return true;
        if (o4 === 0 && onSegment(p2, q1, q2)) return true;
        return false;
    };
    if (p1.x >= bb.x && p1.x <= bb.x + bb.width && p1.y >= bb.y && p1.y <= bb.y + bb.height) return true;
    if (p2.x >= bb.x && p2.x <= bb.x + bb.width && p2.y >= bb.y && p2.y <= bb.y + bb.height) return true;
    const lines = [
        [{ x: bb.x, y: bb.y }, { x: bb.x + bb.width, y: bb.y }],
        [{ x: bb.x, y: bb.y + bb.height }, { x: bb.x + bb.width, y: bb.y + bb.height }],
        [{ x: bb.x, y: bb.y }, { x: bb.x, y: bb.y + bb.height }],
        [{ x: bb.x + bb.width, y: bb.y }, { x: bb.x + bb.width, y: bb.y + bb.height }],
    ];
    for (const line of lines) {
        if (segmentsIntersect(p1, p2, line[0], line[1])) return true;
    }
    return false;
};

export const Canvas: React.FC<CanvasProps> = ({ items, setItems, selectedTool, toolOptions, transform, setTransform, selectedItemIds, setSelectedItemIds, undo, redo, backgroundColor, setBackgroundColor, backgroundColors, onEnterPresentation, isPresentationMode,
    presentationFitTransform,
    gridOpacity,
    setGridOpacity,
    onYoutubePlay,
    isMultiTouchEnabled = false,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const backgroundCanvasCache = useRef(document.createElement('canvas'));
    const textInputRef = useRef<HTMLTextAreaElement>(null);
    const tagIconImageRef = useRef<HTMLImageElement | null>(null);

    // Track active pointers for multi-touch (pinch-zoom) with PointerEvents
    const activePointersRef = useRef<Map<number, { clientX: number, clientY: number }>>(new Map());
    const lastTapRef = useRef<{ time: number, id: string | null }>({ time: 0, id: null });

    // Use a ref to keep track of the latest state variables needed in event listeners
    // This avoids stale closures without re-binding the event listeners on every render
    const latestStateRef = useRef({
        transform,
        isPresentationMode,
        presentationFitTransform,
        items,
        selectedItemIds
    });

    useEffect(() => {
        latestStateRef.current = {
            transform,
            isPresentationMode,
            presentationFitTransform,
            items,
            selectedItemIds
        };
    }, [transform, isPresentationMode, presentationFitTransform, items, selectedItemIds]);

    const [isDrawing, setIsDrawing] = useState(false); // Drawing, dragging, or panning
    const [currentItems, setCurrentItems] = useState<Map<number, CanvasItem>>(new Map());

    const [draggedState, setDraggedState] = useState<{
        startMousePos: { x: number; y: number };
        currentMousePos: { x: number; y: number };
        initialItemPositions: Map<string, { x: number; y: number }>;
    } | null>(null);

    const [resizingItem, setResizingItem] = useState<{
        item: TextItem;
        originalItem: TextItem;
        handle: string;
        startX: number;
        startY: number;
    } | null>(null);

    const [erasedDuringDraw, setErasedDuringDraw] = useState<Set<string>>(new Set());
    const [marquee, setMarquee] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);

    const [editingText, setEditingText] = useState<{ item: TextItem | null, isNew: boolean }>({ item: null, isNew: false });
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

    const [isPanningMode, setIsPanningMode] = useState(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const panStartPosRef = useRef<{ x: number; y: number } | null>(null);

    const [isPartialErasing, setIsPartialErasing] = useState(false);
    const [eraserPath, setEraserPath] = useState<{ x: number, y: number }[] | null>(null);
    const eraserLastPosRef = useRef<{ x: number, y: number } | null>(null);

    const [imagesLoaded, setImagesLoaded] = useState(0);

    // Refs for inertia panning
    const velocityRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);
    const lastMoveTimeRef = useRef<number | null>(null);

    // Refs for pinch-to-zoom
    const pinchStartRef = useRef<{
        distance: number;
        transform: Transform;
        midPointScreen: { x: number; y: number };
        activeIds: string;
    } | null>(null);

    // New state for Grid Slider visibility with delay
    const [showGridSlider, setShowGridSlider] = useState(false);
    const gridSliderTimeoutRef = useRef<number | null>(null);

    const handleGridMouseEnter = () => {
        if (gridSliderTimeoutRef.current) {
            clearTimeout(gridSliderTimeoutRef.current);
            gridSliderTimeoutRef.current = null;
        }
        setShowGridSlider(true);
    };

    const handleGridMouseLeave = () => {
        gridSliderTimeoutRef.current = window.setTimeout(() => {
            setShowGridSlider(false);
        }, 300);
    };

    const handleResetZoom = () => {
        setTransform(prev => ({ ...prev, scale: 1 }));
    };

    const getCanvasContext = useCallback(() => canvasRef.current?.getContext('2d'), []);

    const getBoundingBox = (item: CanvasItem) => {
        if (item.type === 'path') {
            if (item.points.length === 0) return { x: item.x, y: item.y, width: 0, height: 0 };
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            item.points.forEach(p => {
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
            });
            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        }
        if (item.type === 'tag') {
            return { x: item.x - TAG_ICON_SIZE / 2, y: item.y - TAG_ICON_SIZE / 2, width: TAG_ICON_SIZE, height: TAG_ICON_SIZE };
        }
        if (item.type === 'youtube') {
            return { x: item.x, y: item.y, width: item.width, height: item.height };
        }
        return { x: item.x, y: item.y, width: item.width, height: item.height };
    }

    const drawSelection = (ctx: CanvasRenderingContext2D, item: CanvasItem, canResize: boolean) => {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2 / transform.scale;
        ctx.setLineDash([6 / transform.scale, 4 / transform.scale]);
        const padding = 5 / transform.scale;
        let { x, y, width, height } = getBoundingBox(item);
        ctx.strokeRect(x - padding, y - padding, width + padding * 2, height + padding * 2);
        ctx.setLineDash([]);

        if (item.type === 'text' && canResize) {
            const handleSize = 8 / transform.scale;
            ctx.fillStyle = '#3B82F6';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1 / transform.scale;

            const handles = [
                { x: x, y: y }, // top-left
                { x: x + width, y: y }, // top-right
                { x: x, y: y + height }, // bottom-left
                { x: x + width, y: y + height }, // bottom-right
            ];

            handles.forEach(handle => {
                ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            });
        }
    }

    const drawItem = useCallback((ctx: CanvasRenderingContext2D, item: CanvasItem) => {
        if (editingText.item && editingText.item.id === item.id) return;

        switch (item.type) {
            case 'image':
            case 'sticker':
            case 'youtube':
                const imgSource = item.type === 'youtube'
                    ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`
                    : item.dataUrl;

                const img = imageCache.current.get(imgSource);
                if (img) {
                    ctx.drawImage(img, item.x, item.y, item.width, item.height);
                    if (item.type === 'youtube') {
                        // Draw Play Button overlay
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.fillRect(item.x, item.y, item.width, item.height);
                        ctx.fillStyle = '#FF0000';
                        const px = item.x + item.width / 2;
                        const py = item.y + item.height / 2;
                        ctx.beginPath();
                        ctx.arc(px, py, 30, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.moveTo(px - 10, py - 15);
                        ctx.lineTo(px + 15, py);
                        ctx.lineTo(px - 10, py + 15);
                        ctx.fill();
                    }
                } else {
                    const newImg = new Image();
                    // crossOrigin is required for YouTube thumbnails to draw to canvas without tainting it for later save routines
                    if (item.type === 'youtube') newImg.crossOrigin = "anonymous";
                    newImg.src = imgSource;
                    newImg.onload = () => {
                        imageCache.current.set(imgSource, newImg);
                        setImagesLoaded(c => c + 1);
                    };
                }
                break;
            case 'tag':
                if (tagIconImageRef.current) {
                    const iconSize = TAG_ICON_SIZE;
                    ctx.drawImage(tagIconImageRef.current, item.x - iconSize / 2, item.y - iconSize / 2, iconSize, iconSize);
                }
                break;
            case 'path':
                ctx.beginPath();
                ctx.strokeStyle = item.strokeColor;
                ctx.lineWidth = item.strokeWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.globalAlpha = item.isHighlighter ? 0.3 : 1.0;

                if (item.points.length < 3) {
                    item.points.forEach((point, index) => {
                        if (index === 0) ctx.moveTo(point.x, point.y);
                        else ctx.lineTo(point.x, point.y);
                    });
                } else {
                    // Smooth curve using Quadratic Bezier
                    ctx.moveTo(item.points[0].x, item.points[0].y);
                    let i = 1;
                    for (; i < item.points.length - 2; i++) {
                        const xc = (item.points[i].x + item.points[i + 1].x) / 2;
                        const yc = (item.points[i].y + item.points[i + 1].y) / 2;
                        ctx.quadraticCurveTo(item.points[i].x, item.points[i].y, xc, yc);
                    }
                    // Curve through the last two points
                    ctx.quadraticCurveTo(
                        item.points[i].x,
                        item.points[i].y,
                        item.points[i + 1].x,
                        item.points[i + 1].y
                    );
                }

                ctx.stroke();
                ctx.globalAlpha = 1.0;
                break;
            case 'shape':
                ctx.beginPath();
                ctx.strokeStyle = item.strokeColor;
                ctx.lineWidth = item.strokeWidth;
                ctx.fillStyle = item.fillColor;

                const w = item.width;
                const h = item.height;
                const x = w < 0 ? item.x + w : item.x;
                const y = h < 0 ? item.y + h : item.y;
                const absW = Math.abs(w);
                const absH = Math.abs(h);

                switch (item.shape) {
                    case 'rectangle':
                        ctx.rect(x, y, absW, absH);
                        break;
                    case 'circle':
                        ctx.ellipse(x + absW / 2, y + absH / 2, absW / 2, absH / 2, 0, 0, 2 * Math.PI);
                        break;
                    case 'triangle':
                        ctx.moveTo(x + absW / 2, y);
                        ctx.lineTo(x + absW, y + absH);
                        ctx.lineTo(x, y + absH);
                        ctx.closePath();
                        break;
                    case 'pentagon': {
                        const centerX = x + absW / 2;
                        const centerY = y + absH / 2;
                        const radiusX = absW / 2;
                        const radiusY = absH / 2;
                        const rotation = -Math.PI / 2; // Start from top point
                        ctx.moveTo(centerX + radiusX * Math.cos(rotation), centerY + radiusY * Math.sin(rotation));
                        for (let i = 1; i <= 5; i++) {
                            ctx.lineTo(
                                centerX + radiusX * Math.cos(rotation + i * 2 * Math.PI / 5),
                                centerY + radiusY * Math.sin(rotation + i * 2 * Math.PI / 5)
                            );
                        }
                        break;
                    }
                }
                ctx.fill();
                ctx.stroke();
                break;
            case 'text':
                const { lines, lineHeight } = measureMultilineText(ctx, item);
                ctx.font = `${item.isItalic ? 'italic ' : ''}${item.isBold ? 'bold ' : ''}${item.fontSize}px ${item.fontFamily}`;
                ctx.fillStyle = item.color;
                ctx.textBaseline = 'top';
                lines.forEach((line, index) => {
                    ctx.fillText(line, item.x, item.y + (index * lineHeight));
                });
                break;
        }
    }, [editingText.item]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        if (gridOpacity <= 0) return;

        const gridSize = 50;
        const startX = -transform.x / transform.scale;
        const startY = -transform.y / transform.scale;
        const endX = (width - transform.x) / transform.scale;
        const endY = (height - transform.y) / transform.scale;

        // Calculate the first line to draw that is visible
        const firstLineX = Math.floor(startX / gridSize) * gridSize;
        const firstLineY = Math.floor(startY / gridSize) * gridSize;

        ctx.save();

        // Adjust grid color based on background color
        const isDark = isDarkColor(backgroundColor);
        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${gridOpacity})` : `rgba(0, 0, 0, ${gridOpacity})`;

        // Ensure line width remains constant regardless of zoom
        ctx.lineWidth = 1 / transform.scale;

        ctx.beginPath();

        // Vertical lines
        for (let x = firstLineX; x <= endX; x += gridSize) {
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
        }

        // Horizontal lines
        for (let y = firstLineY; y <= endY; y += gridSize) {
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
        }

        ctx.stroke();
        ctx.restore();
    };

    const getVisibleBounds = (canvasWidth: number, canvasHeight: number, currentTransform: Transform) => {
        return {
            x: -currentTransform.x / currentTransform.scale,
            y: -currentTransform.y / currentTransform.scale,
            width: canvasWidth / currentTransform.scale,
            height: canvasHeight / currentTransform.scale
        };
    };

    const intersects = (r1: { x: number, y: number, width: number, height: number }, r2: { x: number, y: number, width: number, height: number }) => {
        return !(r2.x > r1.x + r1.width || 
                 r2.x + r2.width < r1.x || 
                 r2.y > r1.y + r1.height ||
                 r2.y + r2.height < r1.y);
    };

    const updateBackgroundCache = useCallback(() => {
        const canvas = canvasRef.current;
        const bgCanvas = backgroundCanvasCache.current;
        if (!canvas) return;

        if (bgCanvas.width !== canvas.width || bgCanvas.height !== canvas.height) {
            bgCanvas.width = canvas.width;
            bgCanvas.height = canvas.height;
        }

        const ctx = bgCanvas.getContext('2d');
        if (!ctx) return;

        ctx.save();
        // Use background color from state
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);

        drawGrid(ctx, bgCanvas.width, bgCanvas.height);

        const visibleItems = items.filter(item => item.visible && !erasedDuringDraw.has(item.id));
        const sortedItems = [...visibleItems].sort((a, b) => a.zIndex - b.zIndex);

        const visibleViewport = getVisibleBounds(bgCanvas.width, bgCanvas.height, transform);

        sortedItems.forEach(item => {
            if ((draggedState && selectedItemIds.includes(item.id)) || 
                (resizingItem && item.id === resizingItem.item.id)) {
                return;
            }
            
            const itemBounds = getBoundingBox(item);
            if (intersects(itemBounds, visibleViewport)) {
                drawItem(ctx, item);
            }
        });

        ctx.restore();
    }, [items, transform, gridOpacity, backgroundColor, erasedDuringDraw, draggedState, resizingItem, selectedItemIds, drawItem]);

    const drawAll = useCallback(() => {
        const ctx = getCanvasContext();
        const canvas = canvasRef.current;
        const bgCanvas = backgroundCanvasCache.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the cached background
        ctx.drawImage(bgCanvas, 0, 0);

        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);

        const dragDelta = draggedState
            ? {
                dx: draggedState.currentMousePos.x - draggedState.startMousePos.x,
                dy: draggedState.currentMousePos.y - draggedState.startMousePos.y,
            }
            : { dx: 0, dy: 0 };

        const visibleItems = items.filter(item => item.visible && !erasedDuringDraw.has(item.id));
        const sortedItems = [...visibleItems].sort((a, b) => a.zIndex - b.zIndex);

        const visibleViewport = getVisibleBounds(canvas.width, canvas.height, transform);

        sortedItems.forEach(item => {
            let itemToDraw = item;
            let boundsToTest = null;

            if (draggedState && selectedItemIds.includes(item.id)) {
                const initialPos = draggedState.initialItemPositions.get(item.id);
                if (initialPos) {
                    itemToDraw = { ...item, x: initialPos.x + dragDelta.dx, y: initialPos.y + dragDelta.dy };
                    boundsToTest = getBoundingBox(itemToDraw);
                }
            } else if (resizingItem && item.id === resizingItem.item.id) {
                itemToDraw = resizingItem.item;
                boundsToTest = getBoundingBox(itemToDraw);
            }

            // Only dynamically draw items if they are currently being manipulated OR they are being tracked but are within viewport
            // (Note: Static items are handled by the bg canvas and don't enter this drawAll block anyway unless manipulated)
            if (boundsToTest && intersects(boundsToTest, visibleViewport)) {
                 drawItem(ctx, itemToDraw);
            }
        });

        currentItems.forEach(item => drawItem(ctx, item));

        if (eraserPath) {
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 1 / transform.scale;
            ctx.setLineDash([4 / transform.scale, 4 / transform.scale]);
            ctx.beginPath();
            eraserPath.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            ctx.setLineDash([]);
        }

        selectedItemIds.forEach(id => {
            let itemForSelection = items.find(i => i.id === id);
            if (itemForSelection) {
                if (draggedState) {
                    const initialPos = draggedState.initialItemPositions.get(id);
                    if (initialPos) {
                        itemForSelection = { ...itemForSelection, x: initialPos.x + dragDelta.dx, y: initialPos.y + dragDelta.dy };
                    }
                } else if (resizingItem && resizingItem.item.id === id) {
                    itemForSelection = resizingItem.item;
                }

                if (itemForSelection.visible && !erasedDuringDraw.has(id)) {
                    const canResize = selectedItemIds.length === 1 && itemForSelection.type === 'text';
                    drawSelection(ctx, itemForSelection, canResize);
                }
            }
        });

        if (marquee) {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.lineWidth = 1 / transform.scale;
            ctx.setLineDash([4 / transform.scale, 2 / transform.scale]);
            const marqueeWidth = marquee.x2 - marquee.x1;
            const marqueeHeight = marquee.y2 - marquee.y1;
            ctx.fillRect(marquee.x1, marquee.y1, marqueeWidth, marqueeHeight);
            ctx.strokeRect(marquee.x1, marquee.y1, marqueeWidth, marqueeHeight);
            ctx.setLineDash([]);
        }

        ctx.restore();
    }, [items, currentItems, getCanvasContext, drawItem, transform, selectedItemIds, draggedState, resizingItem, erasedDuringDraw, marquee, eraserPath]);

    // Force background cache update when its dependencies change
    useEffect(() => {
        updateBackgroundCache();
    }, [updateBackgroundCache, imagesLoaded]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const resizeCanvas = () => {
                const parent = canvas.parentElement;
                if (parent) {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                }
                updateBackgroundCache();
                drawAll();
            };
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();
            return () => window.removeEventListener('resize', resizeCanvas);
        }
    }, [drawAll, updateBackgroundCache]);

    useEffect(() => {
        drawAll();
    }, [imagesLoaded, drawAll]);

    useEffect(() => {
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>`;
        const encodedSvg = window.btoa(svgString.replace('currentColor', '#3B82F6')); // Use a specific color
        const img = new Image();
        img.src = `data:image/svg+xml;base64,${encodedSvg}`;
        img.onload = () => {
            tagIconImageRef.current = img;
            drawAll(); // Redraw canvas once the image is loaded
        };
    }, [drawAll]);


    const getMousePos = (e: React.PointerEvent | WheelEvent): { x: number; y: number } => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { x: (e as any).clientX - rect.left, y: (e as any).clientY - rect.top };
    };

    const getTransformedMousePos = (e: React.PointerEvent | WheelEvent): { x: number; y: number } => {
        const { x: mouseX, y: mouseY } = getMousePos(e);
        return {
            x: (mouseX - transform.x) / transform.scale,
            y: (mouseY - transform.y) / transform.scale,
        };
    };

    const getItemAtPos = (x: number, y: number): CanvasItem | null => {
        const sortedItems = [...items].sort((a, b) => b.zIndex - a.zIndex);
        for (const item of sortedItems) {
            if (!item.visible) continue;

            if (item.type === 'image' || item.type === 'shape' || item.type === 'text' || item.type === 'sticker' || item.type === 'youtube') {
                if (x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height) {
                    return item;
                }
            } else if (item.type === 'path') {
                const margin = item.strokeWidth / 2 + 5;
                for (const point of item.points) {
                    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                    if (distance < margin) {
                        return item;
                    }
                }
            } else if (item.type === 'tag') {
                const iconSize = TAG_ICON_SIZE;
                if (x >= item.x - iconSize / 2 && x <= item.x + iconSize / 2 && y >= item.y - iconSize / 2 && y <= item.y + iconSize / 2) {
                    return item;
                }
            }
        }
        return null;
    };

    const getResizeHandleAtPos = (x: number, y: number, item: TextItem): string | null => {
        const { x: itemX, y: itemY, width, height } = getBoundingBox(item);
        const handleSize = 10 / transform.scale;
        const halfHandle = handleSize / 2;

        const handles = {
            'top-left': { x: itemX, y: itemY },
            'top-right': { x: itemX + width, y: itemY },
            'bottom-left': { x: itemX, y: itemY + height },
            'bottom-right': { x: itemX + width, y: itemY + height },
        };

        for (const [name, pos] of Object.entries(handles)) {
            if (
                x >= pos.x - halfHandle && x <= pos.x + halfHandle &&
                y >= pos.y - halfHandle && y <= pos.y + halfHandle
            ) {
                return name;
            }
        }
        return null;
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

        if (canvasRef.current) {
            try { canvasRef.current.setPointerCapture(e.pointerId); } catch(err) {}
        }

        // Check for multi-touch (Pinch start) ONLY if tool is hand/select OR multi-touch drawing is disabled
        if ((!isMultiTouchEnabled || selectedTool === 'hand' || selectedTool === 'select') && activePointersRef.current.size === 2) {
            const pointers = Array.from(activePointersRef.current.values()) as { clientX: number, clientY: number }[];
            const activeIds = Array.from(activePointersRef.current.keys()).sort().join(',');
            const rect = canvasRef.current!.getBoundingClientRect();
            pinchStartRef.current = {
                distance: getPointersDistance(pointers),
                transform: { ...transform },
                midPointScreen: getPointersMidpoint(pointers, rect),
                activeIds
            };
            // Cancel any single-finger actions
            setIsDrawing(false);
            setDraggedState(null);
            setCurrentItems(new Map());
            setEraserPath(null);
            setMarquee(null);
            setResizingItem(null);
            return;
        }

        if (e.button !== 0 && e.pointerType === 'mouse') return;
        if (editingText.item) return;

        const { x, y } = getTransformedMousePos(e);
        const clickedItem = getItemAtPos(x, y);

        // Check for double click on Youtube Items
        if (selectedTool === 'select' && clickedItem?.type === 'youtube') {
            const now = Date.now();
            if (now - lastTapRef.current.time < 300 && lastTapRef.current.id === clickedItem.id) {
                // Double tap detected
                if (onYoutubePlay) {
                    onYoutubePlay(clickedItem.videoId);
                }
                return;
            }
            lastTapRef.current = { time: now, id: clickedItem.id };
        }

        const isPanActive = isPanningMode || selectedTool === 'hand';
        if (isPanActive) {
            const mousePos = getMousePos(e);
            lastMousePosRef.current = mousePos;
            panStartPosRef.current = mousePos;
            setIsDrawing(true); // This is for panning
            velocityRef.current = { x: 0, y: 0 };
            lastMoveTimeRef.current = Date.now();
            return;
        }

        if (selectedTool === 'tag') {
            const newTagItem: Omit<TagItem, 'title' | 'zIndex'> = {
                id: generateId(), type: 'tag', x, y, visible: true,
            };
            setItems(currentItems => {
                const maxZIndex = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.zIndex)) : -1;
                const tagCount = currentItems.filter(i => i.type === 'tag').length;
                const finalTagItem: TagItem = {
                    ...newTagItem,
                    title: `Tag ${tagCount + 1}`,
                    zIndex: maxZIndex + 1
                };
                return [...currentItems, finalTagItem];
            });
            return; // This is a single-click action, don't enter drawing mode
        }

        if (selectedTool === 'sticker') {
            const { stickerType, stickerSize } = toolOptions;
            const svgString = stickerSvgs[stickerType];
            const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);

            const newStickerItem: StickerItem = {
                id: generateId(),
                type: 'sticker',
                stickerType,
                dataUrl,
                width: stickerSize,
                height: stickerSize,
                x: x - stickerSize / 2,
                y: y - stickerSize / 2,
                zIndex: 0,
                visible: true,
            };

            setItems(currentItems => {
                const maxZIndex = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.zIndex)) : -1;
                return [...currentItems, { ...newStickerItem, zIndex: maxZIndex + 1 }];
            });
            return; // single-click action
        }

        if (selectedTool === 'select') {
            setIsDrawing(true);
            const selectedItemIfOnlyOne = selectedItemIds.length === 1 ? items.find(i => i.id === selectedItemIds[0]) : null;
            if (selectedItemIfOnlyOne?.type === 'text') {
                const handle = getResizeHandleAtPos(x, y, selectedItemIfOnlyOne);
                if (handle) {
                    setResizingItem({
                        item: selectedItemIfOnlyOne,
                        originalItem: { ...selectedItemIfOnlyOne },
                        handle,
                        startX: x,
                        startY: y
                    });
                    return;
                }
            }

            const item = getItemAtPos(x, y);

            if (item) {
                const isShift = 'shiftKey' in e && e.shiftKey;
                const isSelected = selectedItemIds.includes(item.id);

                let nextSelection = [...selectedItemIds];
                if (isShift) {
                    nextSelection = isSelected ? nextSelection.filter(id => id !== item.id) : [...nextSelection, item.id];
                } else if (!isSelected) {
                    nextSelection = [item.id];
                }
                setSelectedItemIds(nextSelection);

                const initialPositions = new Map<string, { x: number, y: number }>();
                items.forEach(i => {
                    if (nextSelection.includes(i.id)) {
                        initialPositions.set(i.id, { x: i.x, y: i.y });
                    }
                });

                setDraggedState({
                    startMousePos: { x, y },
                    currentMousePos: { x, y },
                    initialItemPositions: initialPositions
                });

            } else {
                // Clicked on empty space, start marquee
                setSelectedItemIds([]);
                setMarquee({ x1: x, y1: y, x2: x, y2: y });
            }
        } else if (selectedTool === 'text') {
            e.preventDefault();
            const newTextItem: TextItem = {
                id: generateId(), type: 'text', x, y, text: '',
                color: toolOptions.strokeColor, fontSize: toolOptions.fontSize,
                fontFamily: 'sans-serif', isBold: toolOptions.isBold, isItalic: toolOptions.isItalic,
                width: 1, height: toolOptions.fontSize * 1.2, // Start with a minimal size
                zIndex: 0, visible: true
            };
            setEditingText({ item: newTextItem, isNew: true });
        } else if (selectedTool === 'pen' || selectedTool === 'highlighter') {
            setIsDrawing(true);
            setCurrentItems(prev => {
                const newMap = new Map(prev);
                newMap.set(e.pointerId, {
                    id: generateId(), type: 'path', x, y, points: [{ x, y }],
                    strokeColor: toolOptions.strokeColor, strokeWidth: toolOptions.strokeWidth,
                    isHighlighter: selectedTool === 'highlighter',
                    zIndex: 0, visible: true
                } as PathItem);
                return newMap;
            });
        } else if (['rectangle', 'circle', 'triangle', 'pentagon'].includes(selectedTool)) {
            setIsDrawing(true);
            setCurrentItems(prev => {
                const newMap = new Map(prev);
                newMap.set(e.pointerId, {
                    id: generateId(), type: 'shape', shape: selectedTool as ShapeType, x, y, width: 0, height: 0,
                    strokeColor: toolOptions.strokeColor, strokeWidth: toolOptions.strokeWidth,
                    fillColor: toolOptions.fillColor,
                    zIndex: 0, visible: true
                } as ShapeItem);
                return newMap;
            });
        } else if (selectedTool === 'eraser') {
            setIsDrawing(true);
            const isCtrl = 'ctrlKey' in e && (e.ctrlKey || e.metaKey);
            setIsPartialErasing(isCtrl);

            if (isCtrl) {
                setEraserPath([{ x, y }]);
            } else {
                eraserLastPosRef.current = { x, y };
                const item = getItemAtPos(x, y);
                if (item && !(item.type === 'image' && item.isPdfPage)) {
                    setErasedDuringDraw(new Set([item.id]));
                }
            }
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || editingText.item) return;

        if (activePointersRef.current.has(e.pointerId)) {
            activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
        }

        // Check for multi-touch (Pinch move) ONLY if tool is hand/select OR multi-touch drawing is disabled
        if ((!isMultiTouchEnabled || selectedTool === 'hand' || selectedTool === 'select') && activePointersRef.current.size === 2) {
            const pointers = Array.from(activePointersRef.current.values()) as { clientX: number, clientY: number }[];
            const activeIds = Array.from(activePointersRef.current.keys()).sort().join(',');

            if (!pinchStartRef.current || pinchStartRef.current.activeIds !== activeIds) {
                const rect = canvasRef.current!.getBoundingClientRect();
                pinchStartRef.current = {
                    distance: getPointersDistance(pointers),
                    transform: { ...transform },
                    midPointScreen: getPointersMidpoint(pointers, rect),
                    activeIds
                };
                return;
            }

            const rect = canvasRef.current!.getBoundingClientRect();
            const newDistance = getPointersDistance(pointers);
            const newMidPoint = getPointersMidpoint(pointers, rect);

            const oldDistance = pinchStartRef.current.distance;
            const oldMidPoint = pinchStartRef.current.midPointScreen;

            if (oldDistance > 0) {
                const scaleRatio = newDistance / oldDistance;

                setTransform(prev => {
                    const newScale = Math.max(0.1, Math.min(prev.scale * scaleRatio, 10));
                    // Incremental update to keep the point under the fingers stable
                    // Effective scale ratio based on previous frame's scale
                    const effectiveScaleRatio = newScale / prev.scale;

                    const newX = newMidPoint.x - (oldMidPoint.x - prev.x) * effectiveScaleRatio;
                    const newY = newMidPoint.y - (oldMidPoint.y - prev.y) * effectiveScaleRatio;

                    return {
                        scale: newScale,
                        x: newX,
                        y: newY
                    };
                });
            }

            // Update ref for next frame
            pinchStartRef.current = {
                distance: newDistance,
                transform: { ...transform },
                midPointScreen: newMidPoint,
                activeIds
            };
            return;
        }

        if (!isDrawing) {
            const isPanActive = isPanningMode || selectedTool === 'hand';
            if (selectedTool === 'select' && !isPanActive) {
                const { x, y } = getTransformedMousePos(e);
                const selectedItemIfOne = selectedItemIds.length === 1 ? items.find(i => i.id === selectedItemIds[0]) : null;
                if (selectedItemIfOne?.type === 'text') {
                    const handle = getResizeHandleAtPos(x, y, selectedItemIfOne);
                    if (handle) {
                        canvas.style.cursor = (handle === 'top-left' || handle === 'bottom-right') ? 'nwse-resize' : 'nesw-resize';
                        return;
                    }
                }
                const item = getItemAtPos(x, y);
                canvas.style.cursor = item ? 'grab' : 'default';
            } else if (!isPanActive) {
                // Apply specific cursors for other tools
                if (selectedTool === 'eraser') {
                    canvas.style.cursor = `url("${CURSOR_SVGS.eraser}") 3 16, cell`;
                } else if (selectedTool === 'pen') {
                    canvas.style.cursor = `url("${CURSOR_SVGS.pen}") 2 22, crosshair`;
                } else if (selectedTool === 'highlighter') {
                    canvas.style.cursor = `url("${CURSOR_SVGS.highlighter}") 3 20, crosshair`;
                } else if (['rectangle', 'circle', 'triangle', 'pentagon'].includes(selectedTool)) {
                    canvas.style.cursor = 'crosshair'; // Drawing precision cursor
                } else if (selectedTool === 'text') {
                    canvas.style.cursor = `url("${CURSOR_SVGS.text}") 12 12, text`;
                } else if (selectedTool === 'sticker' || selectedTool === 'tag') {
                    canvas.style.cursor = 'copy';
                } else {
                    canvas.style.cursor = 'default';
                }
            }
            return;
        }

        const isPanActive = isPanningMode || selectedTool === 'hand';
        if (isPanActive) {
            const { x, y } = getMousePos(e);
            const now = Date.now();
            const dt = now - (lastMoveTimeRef.current || now);

            const dx = x - lastMousePosRef.current.x;
            const dy = y - lastMousePosRef.current.y;

            if (dt > 0) {
                const vx = dx / dt * 16.67; // Velocity in pixels per frame (assuming 60fps)
                const vy = dy / dt * 16.67;
                velocityRef.current.x = velocityRef.current.x * 0.8 + vx * 0.2; // Smoothed velocity
                velocityRef.current.y = velocityRef.current.y * 0.8 + vy * 0.2;
            }

            lastMousePosRef.current = { x, y };
            lastMoveTimeRef.current = now;
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            return;
        }

        const { x, y } = getTransformedMousePos(e);

        if (selectedTool === 'eraser' && isDrawing) {
            if (isPartialErasing) {
                setEraserPath(prev => prev ? [...prev, { x, y }] : null);
            } else {
                const prevPos = eraserLastPosRef.current;
                if (prevPos) {
                    const newErasedIds = new Set<string>();
                    items.forEach(item => {
                        if ((item.type === 'image' && item.isPdfPage) || erasedDuringDraw.has(item.id)) return;

                        const bb = getBoundingBox(item);
                        if (lineSegmentIntersectsAABB({ x: prevPos.x, y: prevPos.y }, { x, y }, bb)) {
                            newErasedIds.add(item.id);
                        }
                    });

                    if (newErasedIds.size > 0) {
                        setErasedDuringDraw(prev => {
                            const updatedSet = new Set(prev);
                            newErasedIds.forEach(id => updatedSet.add(id));
                            return updatedSet;
                        });
                    }
                }
                eraserLastPosRef.current = { x, y };
            }
            return;
        }

        if (marquee) {
            setMarquee(prev => prev ? { ...prev, x2: x, y2: y } : null);
            return;
        }

        if (resizingItem) {
            const { originalItem, startX } = resizingItem;
            const centerX = originalItem.x + originalItem.width / 2;
            const centerY = originalItem.y + originalItem.height / 2;

            const originalDist = Math.sqrt(Math.pow(startX - centerX, 2) + Math.pow(resizingItem.startY - centerY, 2));
            const currentDist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const scaleFactor = originalDist > 0 ? currentDist / originalDist : 1;

            let newFontSize = Math.round(originalItem.fontSize * scaleFactor);
            newFontSize = Math.max(8, Math.min(newFontSize, 512));

            if (newFontSize !== resizingItem.item.fontSize) {
                const ctx = getCanvasContext();
                if (!ctx) return;
                const { width, height } = measureMultilineText(ctx, { ...originalItem, fontSize: newFontSize });
                const newX = centerX - width / 2;
                const newY = centerY - height / 2;
                const updatedItem: TextItem = { ...resizingItem.originalItem, fontSize: newFontSize, width, height, x: newX, y: newY };
                setResizingItem(prev => prev ? { ...prev, item: updatedItem } : null);
            }
        } else if (draggedState) {
            setDraggedState(prev => prev ? { ...prev, currentMousePos: { x, y } } : null);
        } else if (currentItems.has(e.pointerId)) {
            const currentItem = currentItems.get(e.pointerId)!;
            const isShiftPressed = 'shiftKey' in e && e.shiftKey;
            const isAltPressed = 'altKey' in e && e.altKey;

            if (currentItem.type === 'path') {
                if (isShiftPressed) {
                    const startPoint = (currentItem as PathItem).points[0];
                    if (isAltPressed) {
                        // Alt + Shift: simple straight line
                        setCurrentItems(prev => {
                            const newMap = new Map(prev);
                            newMap.set(e.pointerId, { ...currentItem, points: [startPoint, { x, y }] } as PathItem);
                            return newMap;
                        });
                    } else {
                        // Shift only: angle snapping
                        const dx = x - startPoint.x;
                        const dy = y - startPoint.y;

                        if (dx === 0 && dy === 0) {
                            setCurrentItems(prev => {
                                const newMap = new Map(prev);
                                newMap.set(e.pointerId, { ...currentItem, points: [startPoint, { x, y }] } as PathItem);
                                return newMap;
                            });
                            return;
                        }

                        const angle = Math.atan2(dy, dx);
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        // Snap to the closest angle among multiples of 30 and 45 degrees
                        const snapAngle45 = Math.PI / 4;
                        const snapAngle30 = Math.PI / 6;

                        const snappedTo45 = Math.round(angle / snapAngle45) * snapAngle45;
                        const snappedTo30 = Math.round(angle / snapAngle30) * snapAngle30;

                        const diff45 = Math.abs(angle - snappedTo45);
                        const diff30 = Math.abs(angle - snappedTo30);

                        const finalAngle = diff30 < diff45 ? snappedTo30 : snappedTo45;

                        const snappedX = startPoint.x + dist * Math.cos(finalAngle);
                        const snappedY = startPoint.y + dist * Math.sin(finalAngle);

                        setCurrentItems(prev => {
                            const newMap = new Map(prev);
                            newMap.set(e.pointerId, { ...currentItem, points: [startPoint, { x: snappedX, y: snappedY }] } as PathItem);
                            return newMap;
                        });
                    }
                } else {
                    // No Shift: freeform drawing
                    const newPoints: { x: number, y: number }[] = [];

                    // Extract high-frequency coalesced points if available for smoother drawing
                    if (typeof (e.nativeEvent as any).getCoalescedEvents === 'function') {
                        const coalescedEvents = (e.nativeEvent as any).getCoalescedEvents() as PointerEvent[];
                        if (coalescedEvents && coalescedEvents.length > 0) {
                            for (const ce of coalescedEvents) {
                                const rect = canvasRef.current!.getBoundingClientRect();
                                const cx = (ce.clientX - rect.left - transform.x) / transform.scale;
                                const cy = (ce.clientY - rect.top - transform.y) / transform.scale;
                                newPoints.push({ x: cx, y: cy });
                            }
                        } else {
                            newPoints.push({ x, y });
                        }
                    }

                    if (newPoints.length > 0) {
                        setCurrentItems(prev => {
                            const newMap = new Map(prev);
                            newMap.set(e.pointerId, { ...currentItem, points: [...(currentItem as PathItem).points, ...newPoints] } as PathItem);
                            return newMap;
                        });
                    }
                }
            } else if (currentItem.type === 'shape') {
                let width = x - currentItem.x;
                let height = y - currentItem.y;

                if (isShiftPressed) {
                    const maxDim = Math.max(Math.abs(width), Math.abs(height));
                    width = Math.sign(width) * maxDim;
                    height = Math.sign(height) * maxDim;
                }
                setCurrentItems(prev => {
                    const newMap = new Map(prev);
                    newMap.set(e.pointerId, { ...currentItem, width, height } as ShapeItem);
                    return newMap;
                });
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        activePointersRef.current.delete(e.pointerId);

        if (typeof (e.target as Element).releasePointerCapture === 'function') {
            try { (e.target as Element).releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }

        // Check pinch end
        if (pinchStartRef.current && activePointersRef.current.size < 2) {
            pinchStartRef.current = null;
            return;
        }

        const wasPanning = isDrawing && (isPanningMode || selectedTool === 'hand');

        // Check for pause before release to stop inertia
        const PAUSE_THRESHOLD = 100; // ms
        const timeSinceLastMove = Date.now() - (lastMoveTimeRef.current || 0);

        if (wasPanning && timeSinceLastMove > PAUSE_THRESHOLD) {
            velocityRef.current = { x: 0, y: 0 };
        }

        if (selectedTool === 'eraser' && isPartialErasing && eraserPath && eraserPath.length > 1) {
            const ERASE_RADIUS = (toolOptions.strokeWidth / 2) / transform.scale;

            const modifiedItems: { [id: string]: PathItem[] } = {};
            const itemsToDelete = new Set<string>();

            items.forEach(item => {
                if (item.type !== 'path') return;

                const newSegments: { x: number, y: number }[][] = [];
                let currentSegment: { x: number, y: number }[] = [];

                item.points.forEach(point => {
                    let isPointErased = false;
                    for (const eraserPoint of eraserPath) {
                        const distSq = (point.x - eraserPoint.x) ** 2 + (point.y - eraserPoint.y) ** 2;
                        if (distSq < ERASE_RADIUS ** 2) {
                            isPointErased = true;
                            break;
                        }
                    }

                    if (isPointErased) {
                        if (currentSegment.length > 1) {
                            newSegments.push(currentSegment);
                        }
                        currentSegment = [];
                    } else {
                        currentSegment.push(point);
                    }
                });

                if (currentSegment.length > 1) {
                    newSegments.push(currentSegment);
                }

                if (newSegments.length !== 1 || newSegments[0].length !== item.points.length) {
                    itemsToDelete.add(item.id);
                    modifiedItems[item.id] = newSegments.map(points => ({
                        ...item,
                        id: generateId(),
                        points,
                        x: points[0].x,
                        y: points[0].y,
                    }));
                }
            });

            if (itemsToDelete.size > 0) {
                setItems(prev => {
                    const remaining = prev.filter(i => !itemsToDelete.has(i.id));
                    const newPathItems = Object.values(modifiedItems).flat();
                    return [...remaining, ...newPathItems];
                });
            }
        }
        setIsPartialErasing(false);
        setEraserPath(null);
        eraserLastPosRef.current = null;


        if (marquee) {
            const { x1, y1, x2, y2 } = marquee;
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);

            if (Math.abs(x1 - x2) > 5 || Math.abs(y1 - y2) > 5) { // Only select if marquee is big enough
                const selectedIds = items.filter(item => {
                    if (!item.visible) return false;
                    const bb = getBoundingBox(item);
                    return bb.x < maxX && bb.x + bb.width > minX && bb.y < maxY && bb.y + bb.height > minY;
                }).map(item => item.id);
                setSelectedItemIds(selectedIds);
            }
            setMarquee(null);
        }
        if (resizingItem) {
            setItems(prev => prev.map(i => i.id === resizingItem.item.id ? resizingItem.item : i));
            setResizingItem(null);
        }
        if (draggedState) {
            const { x: endX, y: endY } = getTransformedMousePos(e as React.PointerEvent | React.WheelEvent);
            const dx = endX - draggedState.startMousePos.x;
            const dy = endY - draggedState.startMousePos.y;

            if (dx !== 0 || dy !== 0) {
                setItems(prevItems => prevItems.map(item => {
                    const initialPos = draggedState.initialItemPositions.get(item.id);
                    if (initialPos) {
                        return { ...item, x: initialPos.x + dx, y: initialPos.y + dy };
                    }
                    return item;
                }));
            }
            setDraggedState(null);
        }

        if (erasedDuringDraw.size > 0) {
            setItems(prev => prev.filter(i => !erasedDuringDraw.has(i.id)));
            setErasedDuringDraw(new Set());
        }

        if (currentItems.has(e.pointerId)) {
            const finishedItem = currentItems.get(e.pointerId)!;
            const isQuickClick = finishedItem.type === 'path' && finishedItem.points.length < 3;
            
            setItems(prevItems => {
                const maxZIndex = prevItems.length > 0 ? Math.max(...prevItems.map(i => i.zIndex)) : -1;
                let newItem: CanvasItem = { ...finishedItem, zIndex: maxZIndex + 1 };

                if (newItem.type === 'shape') {
                    if (newItem.width < 0 || newItem.height < 0) {
                        if (newItem.width < 0) { newItem.x += newItem.width; newItem.width = -newItem.width; }
                        if (newItem.height < 0) { newItem.y += newItem.height; newItem.height = -newItem.height; }
                    }
                } else if (newItem.type === 'path') {
                    let pathItem = newItem;
                    if (pathItem.points.length === 1) {
                        const point = pathItem.points[0];
                        pathItem = { ...pathItem, points: [...pathItem.points, { x: point.x, y: point.y }] };
                    }

                    if (pathItem.points.length < 2) return prevItems;

                    if (isQuickClick) {
                        const p1 = pathItem.points[0];
                        const p2 = pathItem.points[pathItem.points.length - 1];
                        const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
                        if (dist < 2) { // Threshold for a "dot"
                            pathItem = { ...pathItem, points: [p1, { x: p1.x + 0.1, y: p1.y + 0.1 }] }; // Create a minimal dot
                        }
                    }
                    newItem = pathItem;
                }

                const newItems = [...prevItems, newItem];
                return newItems;
            });
            
            setCurrentItems(prev => {
                const newMap = new Map(prev);
                newMap.delete(e.pointerId);
                return newMap;
            });
        }

        setIsDrawing(currentItems.size > 1); // Only fully stop drawing if this was the last active pointer

        if (wasPanning) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const INERTIA_VELOCITY_THRESHOLD = 5; // pixels per frame
            const INERTIA_FRICTION = 0.95;

            if (Math.abs(velocityRef.current.x) > INERTIA_VELOCITY_THRESHOLD || Math.abs(velocityRef.current.y) > INERTIA_VELOCITY_THRESHOLD) {
                const step = () => {
                    if (!canvasRef.current) return;

                    velocityRef.current.x *= INERTIA_FRICTION;
                    velocityRef.current.y *= INERTIA_FRICTION;

                    setTransform(prev => ({
                        ...prev,
                        x: prev.x + velocityRef.current.x,
                        y: prev.y + velocityRef.current.y
                    }));

                    if (Math.abs(velocityRef.current.x) > 0.5 || Math.abs(velocityRef.current.y) > 0.5) {
                        animationFrameRef.current = requestAnimationFrame(step);
                    } else {
                        velocityRef.current = { x: 0, y: 0 };
                        animationFrameRef.current = null;
                    }
                };
                animationFrameRef.current = requestAnimationFrame(step);
            }
        }
    };

    // Add Zoom support via Wheel
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Prevent default browser zoom if possible (requires passive: false in real listener)
            // For React onWheel, we handle logic here.

            // However, React event handlers are passive by default.
            // We handle the visual zoom update:
            const { x: mouseX, y: mouseY } = getMousePos(e);
            const delta = -e.deltaY;
            const zoomFactor = 0.001;
            const newScale = transform.scale * (1 + delta * zoomFactor);
            const clampedScale = Math.max(0.1, Math.min(newScale, 10));

            const scaleRatio = clampedScale / transform.scale;
            const newX = mouseX - (mouseX - transform.x) * scaleRatio;
            const newY = mouseY - (mouseY - transform.y) * scaleRatio;

            setTransform({ scale: clampedScale, x: newX, y: newY });
        } else {
            // Pan
            setTransform(prev => ({
                ...prev,
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    };

    // Prevent default browser zoom behavior
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const preventDefault = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) e.preventDefault();
        };

        canvas.addEventListener('wheel', preventDefault, { passive: false });
        return () => canvas.removeEventListener('wheel', preventDefault);
    }, []);


    const handleTextEditBlur = () => {
        if (editingText.item) {
            const text = textInputRef.current?.value.trim();
            if (text) {
                const ctx = getCanvasContext();
                if (ctx) {
                    const { width, height } = measureMultilineText(ctx, { ...editingText.item, text });
                    const updatedItem = { ...editingText.item, text, width, height };
                    if (editingText.isNew) {
                        setItems(prev => {
                            const maxZIndex = prev.length > 0 ? Math.max(...prev.map(i => i.zIndex)) : -1;
                            return [...prev, { ...updatedItem, zIndex: maxZIndex + 1 }];
                        });
                    } else {
                        setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
                    }
                }
            }
        }
        setEditingText({ item: null, isNew: false });
    };

    const handleTextEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            setEditingText({ item: null, isNew: false });
        }
        // Allow Shift+Enter for new lines, but Enter (without shift) could confirm if desired.
        // For now, let's just rely on click-away (blur) or simple standard behavior.
        // If we want Enter to finish editing:
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTextEditBlur();
        }
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerOut={handlePointerUp}
                onWheel={handleWheel}
                style={{ touchAction: 'none', backgroundColor }}
                className="absolute top-0 left-0 w-full h-full touch-none"
            />
            {editingText.item && (
                <textarea
                    ref={textInputRef}
                    defaultValue={editingText.item.text}
                    onBlur={handleTextEditBlur}
                    onKeyDown={handleTextEditKeyDown}
                    style={{
                        position: 'absolute',
                        left: (editingText.item.x * transform.scale + transform.x) + 'px',
                        top: (editingText.item.y * transform.scale + transform.y) + 'px',
                        fontSize: (editingText.item.fontSize * transform.scale) + 'px',
                        fontFamily: editingText.item.fontFamily,
                        fontWeight: editingText.item.isBold ? 'bold' : 'normal',
                        fontStyle: editingText.item.isItalic ? 'italic' : 'normal',
                        color: editingText.item.color,
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px dashed #3B82F6',
                        outline: 'none',
                        padding: '0',
                        margin: '0',
                        resize: 'none',
                        overflow: 'hidden',
                        whiteSpace: 'pre',
                        zIndex: 100,
                        minWidth: '50px',
                        minHeight: (editingText.item.fontSize * transform.scale * 1.2) + 'px'
                    }}
                    autoFocus
                />
            )}

            {/* Background Color Toggle - Top Right */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    className="w-9 h-9 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 ring-1 ring-gray-200 pointer-events-auto"
                    style={{ backgroundColor: backgroundColor }}
                    onClick={() => {
                        const currentIndex = backgroundColors.findIndex(c => c.color === backgroundColor);
                        const nextIndex = (currentIndex === -1) ? 0 : (currentIndex + 1) % backgroundColors.length;
                        setBackgroundColor(backgroundColors[nextIndex].color);
                    }}
                    title="Click to toggle background color"
                />
            </div>

            {/* Zoom & Grid Controls - Bottom Right */}
            <div className="absolute bottom-5 right-5 flex flex-col items-end gap-3 z-10 pointer-events-none">

                {/* Zoom Indicator */}
                <button
                    onClick={handleResetZoom}
                    className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 pointer-events-auto transition-transform active:scale-95 w-16 flex justify-center"
                    title="Reset Zoom to 100%"
                >
                    {Math.round(transform.scale * 100)}%
                </button>

                {/* Grid Control */}
                <div
                    className="relative pointer-events-auto flex items-center justify-end"
                    onMouseEnter={handleGridMouseEnter}
                    onMouseLeave={handleGridMouseLeave}
                >
                    {/* Slider Popup */}
                    <div
                        className={`absolute right-12 mr-2 h-10 flex items-center bg-white/90 backdrop-blur px-3 rounded-lg shadow-md border border-gray-200 transition-all duration-200 origin-right ${showGridSlider ? 'opacity-100 scale-100 translate-x-0 visible' : 'opacity-0 scale-95 translate-x-4 invisible'}`}
                    >
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={gridOpacity}
                            onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            title={`Grid Opacity: ${Math.round(gridOpacity * 100)}%`}
                        />
                    </div>

                    <button
                        className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-colors border-2 ${gridOpacity > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-white text-gray-500 hover:bg-gray-100'}`}
                        onClick={() => setGridOpacity(gridOpacity > 0 ? 0 : 0.2)}
                        title="Toggle Grid"
                    >
                        <Icon name="grid" className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </>
    );
};
