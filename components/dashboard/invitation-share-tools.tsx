"use client";

import { useState } from "react";
import { Download, Printer, QrCode as QrIcon } from "lucide-react";
import { WhatsAppShare, type ShareGuest } from "./whatsapp-share";
import { QrCode, downloadQrCanvas } from "./qr-code";

const QR_CANVAS_ID = "invitation-general-qr";

/**
 * Alat berbagi lengkap: tombol WhatsApp, pratinjau pesan, dan QR
 * undangan umum yang bisa diunduh atau dicetak.
 */
export function InvitationShareTools({
  publicUrl,
  eventTitle,
  slug,
  guests,
}: {
  publicUrl: string;
  eventTitle: string;
  slug: string;
  guests: ShareGuest[];
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  function handleDownload() {
    const ok = downloadQrCanvas(QR_CANVAS_ID, `undangan-${slug}-qr`);
    if (!ok) {
      setQrError("QR belum siap. Tunggu sebentar lalu coba lagi.");
      setTimeout(() => setQrError(null), 3000);
    }
  }

  function handlePrint() {
    const canvas = document.getElementById(QR_CANVAS_ID);
    if (!(canvas instanceof HTMLCanvasElement)) {
      setQrError("QR belum siap.");
      setTimeout(() => setQrError(null), 3000);
      return;
    }
    const win = window.open("", "_blank", "width=520,height=680");
    if (!win) {
      setQrError("Popup diblokir browser. Izinkan popup untuk mencetak.");
      setTimeout(() => setQrError(null), 3000);
      return;
    }
    win.document.write(
      `<!doctype html><html><head><title>QR Undangan — ${eventTitle}</title>
       <style>
         body{font-family:system-ui,sans-serif;text-align:center;padding:32px;color:#16120E}
         img{width:420px;height:420px;image-rendering:pixelated}
         h1{font-size:20px;margin:0 0 4px}
         p{font-size:13px;color:#6B6259;margin:0 0 20px;word-break:break-all}
         @media print{body{padding:0}}
       </style></head><body>
       <h1>${eventTitle}</h1>
       <p>${publicUrl}</p>
       <img src="${canvas.toDataURL("image/png")}" alt="QR undangan" />
       </body></html>`,
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <div className="border-b border-ink-100 bg-gradient-to-r from-[#E7F8EF] via-white to-[#F3F0FF] px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
          <QrIcon size={16} className="text-gold-600" /> Bagikan &amp; cetak
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-400">
          Kirim lewat WhatsApp dengan satu klik, atau cetak QR untuk ditempel di meja tamu.
        </p>
      </div>

      <div className="p-5">
        <WhatsAppShare publicUrl={publicUrl} eventTitle={eventTitle} guests={guests} />

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
          <button
            type="button"
            onClick={() => setQrOpen((v) => !v)}
            className="btn btn-outline !py-2.5 !text-[13px]"
            aria-expanded={qrOpen}
          >
            <QrIcon size={14} />
            {qrOpen ? "Sembunyikan QR" : "Tampilkan QR"}
          </button>
          {qrOpen && (
            <>
              <button type="button" onClick={handleDownload} className="btn btn-primary !py-2.5 !text-[13px]">
                <Download size={14} /> Unduh PNG
              </button>
              <button type="button" onClick={handlePrint} className="btn btn-outline !py-2.5 !text-[13px]">
                <Printer size={14} /> Cetak
              </button>
            </>
          )}
        </div>

        {qrError && <p className="mt-3 text-xs font-semibold text-red-600">{qrError}</p>}

        {qrOpen && (
          <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gold-400/60 bg-ivory-50 p-6 sm:flex-row sm:items-start">
            <div className="shrink-0 rounded-2xl border border-ink-200 bg-white p-3 shadow-sm">
              <QrCode id={QR_CANVAS_ID} value={publicUrl} size={200} />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-sm font-extrabold text-ink-900">QR undangan umum</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                Pindai dengan kamera HP untuk membuka {eventTitle}. Cocok untuk dicetak dan
                ditempel di meja resepsion, papan pengumuman, atau di Backdrop.
              </p>
              <p className="mt-2 break-all rounded-lg bg-white px-2.5 py-1.5 font-mono text-[11px] text-ink-500">
                {publicUrl}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
