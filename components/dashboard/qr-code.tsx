"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QrCode({ value, size = 192 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current && value) {
      QRCode.toCanvas(ref.current, value, { width: size, margin: 1 }).catch(() => {});
    }
  }, [value, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} />;
}