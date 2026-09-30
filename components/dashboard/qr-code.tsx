"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

/**
 * Kode QR yang bisa dipindai.
 *
 * - errorCorrectionLevel H: tahan cetak & tertutup sebagian.
 * - margin 4: quiet zone minimal versi spesifikasi QR.
 * - canvas 2x lalu di-shrink: tajam di layar HP dan cetak.
 * - hitam di atas putih: kontras maksimum untuk scanner.
 */
export function QrCode({
  value,
  size = 192,
  id,
  className = "",
}: {
  value: string;
  size?: number;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !value) return;
    let cancelled = false;
    QRCode.toCanvas(canvas, value, {
      width: size * 2,
      margin: 4,
      errorCorrectionLevel: "H",
      color: { dark: "#000000ff", light: "#ffffffff" },
    })
      .then(() => {
        if (!cancelled) canvas.setAttribute("data-qr-ready", "1");
      })
      .catch(() => {
        canvas.removeAttribute("data-qr-ready");
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <canvas
      ref={ref}
      id={id}
      data-qr-ready="0"
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

/** Unduh canvas QR yang sudah dirender sebagai PNG resolusi tinggi. */
export function downloadQrCanvas(canvasId: string, filename: string): boolean {
  if (typeof document === "undefined") return false;
  const canvas = document.getElementById(canvasId);
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  if (canvas.getAttribute("data-qr-ready") !== "1") return false;
  try {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}
