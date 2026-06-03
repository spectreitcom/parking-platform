export abstract class ImageProcessing {
  abstract resize(
    imageBuffer: Buffer,
    width?: number,
    height?: number,
  ): Promise<Buffer>;
}
