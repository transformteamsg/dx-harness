"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/* The builders' band answers the pointer: drafting marks bloom on a fixed grid
   where the pointer passes and decay behind it, so the paragraph about how the
   harness feels to use is the one place on the page that responds to your hand.

   The mechanic is ported from the reference the builder chose (the ga-hero-ink
   pointer field): a fixed character cell, a band painted along the pointer's
   path, cells that accumulate where the pointer lingers, and one decay that
   unwinds each cell back down a density ramp. One thing is deliberately not
   ported. The reference draws ASCII glyphs in a monospace stack, and a third
   typeface in product UI is a TYP-1 (L1) finding — the site's one mono waiver
   is confined to the builder's-note postcard. So the ramp is drawn instead, in
   the marks this sheet already uses: a construction point, a scale division, a
   registration cross, a circled crossing, and a snap handle. Same field, the
   drawing's own vocabulary.

   Four rules keep it decoration rather than interface:

   1. **It is occluded, never cleared.** The canvas sits under the band's words
      and the action, which paint over it and cut the field to their own shapes.
      Carving a padded hole around the text instead reads as damage.
   2. **It never reaches the text.** The marks pass behind the band's words, so
      the alpha ceiling is set where the darkest mark still leaves the statement
      and the action above 8:1 on the wash — nowhere near the AA floor (A11Y-1).
   3. **It draws from the sheet's tokens or not at all.** Ink, grid pitch and
      decay all come from custom properties (TOK-1, MOT-2); if any is missing
      the field simply does not run, because nothing is lost when decoration
      declines to draw.
   4. **It withdraws when it is not wanted.** No server render, no mount under
      prefers-reduced-motion (A11Y-5) and none for a coarse pointer (there is
      nothing to follow on touch). It takes no pointer events, carries no
      information (MOT-3), and is hidden from assistive technology (A11Y-6).
      Under `forced-colors: active` it hides, the same answer the sheet ground
      gives: a canvas keeps painting its own pixels when the UA forces every
      other colour on the page, which is how a decorative layer ends up LOUDER
      in the mode a reader chose for clarity. Issue #201 is the open proposal to
      make this a control rather than a habit; until then it is a habit kept on
      purpose. */

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

/* The field's rhythm is the sheet's, not a number chosen here: the page ground
   measures on --ground-pitch, and the trail lands on a quarter of that division,
   so every fourth mark sits on a line the drawing already draws. */
const CELLS_PER_PITCH = 4;
/** Tile drawn per cell; wider than the cell so no mark clips its own box. */
const TILE_PX = 14;
/** Band radius in cells — a stroke about five cells across. */
const BRUSH_CELLS = 2;
/** Deposit per painted step, so a sweep tints a patch and a pause saturates it. */
const PAINT_STRENGTH = 0.6;
/** Ceiling on live cells: a fast sweep across a wide band cannot outrun it. */
const CELL_CEILING = 900;
/* Quiet by construction. The band's ground is a pale wash and its ink is the
   blueprint's readable step, so even the heaviest mark reads as a pencil note
   rather than a second colour on the page. */
const MIN_ALPHA = 0.12;
const MAX_ALPHA = 0.5;
/** Cells are keyed as one number; no band is 4096 cells (16k px) wide. */
const KEY_STRIDE = 4096;

type Mark = (ctx: CanvasRenderingContext2D, x: number, y: number) => void;

/* Light → heavy. A cell's mark is chosen by how bright the cell currently is,
   so one trail decays *through* the ramp — resolved handles under the pointer
   unwinding into bare construction points behind it. Stroked marks take the
   half-pixel nudge that keeps a hairline on one device pixel rather than
   smeared across two. */
const MARK_RAMP: Mark[] = [
  // A construction point: the faintest thing the sheet draws.
  (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 1.1, 0, Math.PI * 2);
    ctx.fill();
  },
  // A scale division off the ruler.
  (ctx, x, y) => {
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 0.5);
    ctx.lineTo(x + 3, y + 0.5);
    ctx.stroke();
  },
  // A registration cross.
  (ctx, x, y) => {
    ctx.beginPath();
    ctx.moveTo(x - 3.5, y + 0.5);
    ctx.lineTo(x + 3.5, y + 0.5);
    ctx.moveTo(x + 0.5, y - 3.5);
    ctx.lineTo(x + 0.5, y + 3.5);
    ctx.stroke();
  },
  // The crossing circled — how the drawing calls a point out.
  (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x + 0.5, y + 0.5, 3, 0, Math.PI * 2);
    ctx.stroke();
  },
  // A snap handle: the heaviest mark, and the only filled one.
  (ctx, x, y) => {
    ctx.fillRect(x - 2, y - 2, 4, 4);
  },
];

type Cell = {
  cx: number;
  cy: number;
  /** 0–1. Drives both the alpha and which mark the cell shows. */
  level: number;
  /** Nudges this cell's place on the ramp, so a flat patch is not uniform. */
  seed: number;
};

/** A token's length in px, or 0 when it is missing or unusable. */
function readLength(styles: CSSStyleDeclaration, token: string): number {
  const value = Number.parseFloat(styles.getPropertyValue(token));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/* A duration token in milliseconds, or 0 when it is missing or unusable. The
   unit is read rather than assumed: the build minifies `2400ms` to `2.4s`, and
   a parseFloat that trusts the authored unit gets a 2.4ms trail that decays
   inside one frame. */
function readDurationMs(styles: CSSStyleDeclaration, token: string): number {
  const raw = styles.getPropertyValue(token).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (raw.endsWith("ms")) return value;
  return raw.endsWith("s") ? value * 1000 : 0;
}

export function InkTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    const query = window.matchMedia(HOVER_QUERY);
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const styles = getComputedStyle(host);
    const ink = styles.getPropertyValue("--blueprint-ink").trim();
    const pitch = readLength(styles, "--ground-pitch");
    const life = readDurationMs(styles, "--motion-trail");
    // Decoration draws from the sheet's own tokens or it does not draw.
    if (!ink || !pitch || !life) return;

    const cellPx = pitch / CELLS_PER_PITCH;
    /** cell key → cell. Insertion order doubles as oldest-first for eviction. */
    const cells = new Map<number, Cell>();
    let width = 0;
    let height = 0;
    let originX = 0;
    let originY = 0;
    let maxCx = 0;
    let maxCy = 0;
    let frame = 0;
    let lastFrameAt = 0;
    let lastX: number | null = null;
    let lastY: number | null = null;
    /** One strip of the ramp, drawn once per resize and blitted per cell. */
    let atlas: HTMLCanvasElement | null = null;
    let atlasTile = 0;

    /* Pre-drawing the ramp makes a frame N blits rather than N paths — the
       difference between a free effect and a measurable one. */
    const buildAtlas = (dpr: number) => {
      const tile = Math.ceil(TILE_PX * dpr);
      const strip = document.createElement("canvas");
      strip.width = tile * MARK_RAMP.length;
      strip.height = tile;
      const stripCtx = strip.getContext("2d");
      if (!stripCtx) return;
      stripCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stripCtx.fillStyle = ink;
      stripCtx.strokeStyle = ink;
      stripCtx.lineWidth = 1;
      MARK_RAMP.forEach((draw, index) => {
        draw(stripCtx, index * TILE_PX + TILE_PX / 2, TILE_PX / 2);
      });
      atlas = strip;
      atlasTile = tile;
    };

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
      width = rect.width;
      height = rect.height;
      maxCx = Math.floor(width / cellPx);
      maxCy = Math.floor(height / cellPx);
      // A narrower band after resize leaves stray cells beyond the new
      // bounds; drop them rather than let them decay against a canvas
      // they no longer fit.
      for (const [key, cell] of cells) {
        if (cell.cx > maxCx || cell.cy > maxCy) cells.delete(key);
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Resizing the backing store resets context state; reapply it.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildAtlas(dpr);
    };

    /* Scroll moves the band under the pointer but not within itself. */
    const trackOrigin = () => {
      const rect = canvas.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
    };

    const render = (now: number) => {
      frame = 0;
      const elapsed = lastFrameAt ? Math.min(now - lastFrameAt, 120) : 16;
      lastFrameAt = now;
      ctx.clearRect(0, 0, width, height);
      const strip = atlas;
      for (const [key, cell] of cells) {
        cell.level -= elapsed / life;
        if (cell.level <= 0) {
          cells.delete(key);
          continue;
        }
        if (!strip) continue;
        const level = Math.min(cell.level, 1);
        const rampIndex = Math.min(
          Math.max(Math.floor(level * MARK_RAMP.length) + cell.seed, 0),
          MARK_RAMP.length - 1
        );
        ctx.globalAlpha = MIN_ALPHA + (MAX_ALPHA - MIN_ALPHA) * level;
        ctx.drawImage(
          strip,
          rampIndex * atlasTile,
          0,
          atlasTile,
          atlasTile,
          cell.cx * cellPx + cellPx / 2 - TILE_PX / 2,
          cell.cy * cellPx + cellPx / 2 - TILE_PX / 2,
          TILE_PX,
          TILE_PX
        );
      }
      ctx.globalAlpha = 1;
      // The loop exists only while cells do — an idle band costs no frames.
      if (cells.size) frame = requestAnimationFrame(render);
      else lastFrameAt = 0;
    };

    /* Paints the band around one point of the pointer's path. Cells
       accumulate, so lingering saturates a patch while a sweep only tints it —
       the same difference the reference shows between a pause and a flick. */
    const paint = (x: number, y: number) => {
      const centreCx = Math.floor(x / cellPx);
      const centreCy = Math.floor(y / cellPx);
      for (let dy = -BRUSH_CELLS; dy <= BRUSH_CELLS; dy += 1) {
        for (let dx = -BRUSH_CELLS; dx <= BRUSH_CELLS; dx += 1) {
          const distance = Math.hypot(dx, dy);
          if (distance > BRUSH_CELLS + 0.4) continue;
          const cx = centreCx + dx;
          const cy = centreCy + dy;
          if (cx < 0 || cy < 0 || cx > maxCx || cy > maxCy) continue;
          const falloff = 1 - distance / (BRUSH_CELLS + 1);
          // A ragged edge rather than a clean disc: the band's outline is the
          // part that would otherwise look machine-drawn.
          const gain = PAINT_STRENGTH * falloff * (0.45 + Math.random() * 0.55);
          if (gain <= 0.02) continue;
          const key = cy * KEY_STRIDE + cx;
          const existing = cells.get(key);
          if (existing) {
            existing.level = Math.min(existing.level + gain, 1);
            continue;
          }
          cells.set(key, {
            cx,
            cy,
            level: Math.min(gain, 1),
            seed: [-1, 0, 0, 1][Math.floor(Math.random() * 4)],
          });
        }
      }
      while (cells.size > CELL_CEILING) {
        const oldest = cells.keys().next().value;
        if (oldest === undefined) break;
        cells.delete(oldest);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const x = event.clientX - originX;
      const y = event.clientY - originY;
      if (lastX === null || lastY === null) {
        paint(x, y);
      } else {
        // Walk the segment, so a fast sweep leaves a path and not two blots.
        const deltaX = x - lastX;
        const deltaY = y - lastY;
        const steps = Math.min(
          Math.max(Math.ceil(Math.hypot(deltaX, deltaY) / (cellPx * 0.75)), 1),
          96
        );
        for (let step = 1; step <= steps; step += 1) {
          paint(lastX + (deltaX * step) / steps, lastY + (deltaY * step) / steps);
        }
      }
      lastX = x;
      lastY = y;
      if (!frame) frame = requestAnimationFrame(render);
    };

    /* Forget the last point on the way out, so re-entering the band elsewhere
       does not stripe a line across it. */
    const onPointerLeave = () => {
      lastX = null;
      lastY = null;
    };

    measure();
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", trackOrigin, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", trackOrigin);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      aria-hidden
      data-ink-trail
      className="pointer-events-none absolute inset-0 h-full w-full select-none forced-colors:hidden"
      ref={canvasRef}
    />
  );
}
