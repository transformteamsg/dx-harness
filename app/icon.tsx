import { ImageResponse } from "next/og";
import { DXD_MARK_PATH } from "@/components/dxd-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/* The favicon: the DXD mark (components/dxd-mark.tsx), inked at the same
   "finished mark" step the landing blueprint uses (--mark-ink, Radix lime-10)
   once it's traced rather than under construction. Satori can't read CSS
   custom properties, so the value is inlined here, not re-derived. On
   --foreground rather than a light ground: lime-10 measures only ~1.4:1 on
   light surfaces (see globals.css's note on --mark-ink) — fine for a large
   logotype, illegible at favicon size. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#18181b",
        }}
      >
        <svg width={22} height={22} viewBox="255 255 490 490">
          <path fill="#b0e64c" d={DXD_MARK_PATH} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
