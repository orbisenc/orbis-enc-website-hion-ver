import { z } from "zod";

export const remoteBrowserSessionIdSchema = z.string().uuid("올바르지 않은 브라우저 세션입니다.");

export const createRemoteBrowserSessionSchema = z.object({
  width: z.number().int().min(720).max(1920).default(1440),
  height: z.number().int().min(480).max(1200).default(900),
});

const coordinateSchema = z.number().finite().min(0).max(4096);

export const remoteBrowserActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("navigate"), url: z.string().trim().min(1).max(2048) }),
  z.object({ type: z.enum(["back", "forward", "reload"]) }),
  z.object({
    type: z.literal("pointer"),
    phase: z.enum(["down", "move", "up"]),
    x: coordinateSchema,
    y: coordinateSchema,
    button: z.enum(["left", "middle", "right"]).default("left"),
  }),
  z.object({
    type: z.literal("click"),
    x: coordinateSchema,
    y: coordinateSchema,
    button: z.enum(["left", "middle", "right"]).default("left"),
  }),
  z.object({
    type: z.literal("scroll"),
    x: coordinateSchema,
    y: coordinateSchema,
    deltaX: z.number().finite().min(-4000).max(4000),
    deltaY: z.number().finite().min(-4000).max(4000),
  }),
  z.object({
    type: z.literal("key"),
    key: z.enum([
      "Backspace", "Delete", "Enter", "Escape", "Tab", "ArrowUp", "ArrowDown",
      "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", "Control+A",
    ]),
  }),
  z.object({ type: z.literal("type"), text: z.string().min(1).max(1000) }),
  z.object({
    type: z.literal("composition"),
    phase: z.enum(["update", "commit"]),
    text: z.string().min(1).max(1000),
  }),
]);

export type RemoteBrowserAction = z.infer<typeof remoteBrowserActionSchema>;

export interface RemoteBrowserState {
  id: string;
  url: string;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  createdAt: string;
  lastAccessedAt: string;
}
