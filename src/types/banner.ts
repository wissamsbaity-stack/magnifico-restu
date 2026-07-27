import type { ImageCrop } from "@/lib/image-crop";

export interface MenuBanner {
  id: string;
  imageUrl: string;
  imageCrop: ImageCrop | null;
  caption: string | null;
  clickLink: string | null;
  sortOrder: number;
  isEnabled: boolean;
}
