import type { DeviceType } from "@prisma/client";

export type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export interface ImageData {
  id: string;
  url: string;
  alt: string | null;
  isThumbnail: boolean;
  deviceType: DeviceType;
  createdAt: Date;
  updatedAt: Date;
}
