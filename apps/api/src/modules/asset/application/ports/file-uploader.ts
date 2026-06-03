export abstract class FileUploader {
  abstract upload(file: Express.Multer.File): Promise<string>;
  abstract getObjectFromStorage(key: string): Promise<Buffer>;
}
