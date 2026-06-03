import { Injectable } from '@nestjs/common';
import { ImageProcessing } from '../application/ports/image-processing';
import sharp from 'sharp';

@Injectable()
export class SharpImageProcessing implements ImageProcessing {
  async resize(
    imageBuffer: Buffer,
    width?: number,
    height?: number,
  ): Promise<Buffer> {
    if (!width && !height) return imageBuffer;

    const transformer = sharp(imageBuffer).resize({
      width,
      height,
      fit: 'cover',
    });

    return await transformer.toBuffer();
  }
}
