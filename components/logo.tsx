import Link from "next/link";

export function Logo({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span
        className={`grid h-8 w-8 place-items-center rounded-xl text-sm font-black tracking-tight text-white transition-transform group-hover:scale-105 ${
          dark ? "bg-gradient-to-br from-gold-400 to-gold-700" : "bg-gradient-to-br from-gold-400 to-gold-700"
        }`}
      >
        A
      </span>
      <span
        className={`text-[1.15rem] font-extrabold tracking-tight ${
          dark ? "text-white" : "text-ink-900"
        }`}
      >
        AVE<span className="text-gold-500">LORA</span>
      </span>
    </Link>
  );
}