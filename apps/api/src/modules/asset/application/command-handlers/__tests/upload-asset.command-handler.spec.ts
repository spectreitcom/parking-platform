import { Test, TestingModule } from '@nestjs/testing';
import { UploadAssetCommandHandler } from '../upload-asset.command-handler';
import { FileUploader } from '../../ports/file-uploader';
import { AssetRepository } from '../../ports/asset.repository';
import { UploadAssetCommand } from '../../commands/upload-asset.command';
import { Asset } from '../../../domain/asset';
import { Readable } from 'node:stream';
import { UploadValidationStrategy } from '../../upload-validation-strategies';

describe('UploadAssetCommandHandler', () => {
  let handler: UploadAssetCommandHandler;
  let fileUploader: jest.Mocked<FileUploader>;
  let assetRepository: jest.Mocked<AssetRepository>;
  let uploadValidationStrategy: jest.Mocked<UploadValidationStrategy>;

  beforeEach(async () => {
    fileUploader = {
      upload: jest.fn(),
      getObjectFromStorage: jest.fn(),
    };

    assetRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    };

    uploadValidationStrategy = {
      validate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadAssetCommandHandler,
        {
          provide: FileUploader,
          useValue: fileUploader,
        },
        {
          provide: AssetRepository,
          useValue: assetRepository,
        },
      ],
    }).compile();

    handler = module.get<UploadAssetCommandHandler>(UploadAssetCommandHandler);
  });

  it('should upload asset successfully', async () => {
    // Given
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('test'),
      size: 4,
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };
    const command = new UploadAssetCommand(file, uploadValidationStrategy);
    const key = 'assets/test-key';
    fileUploader.upload.mockResolvedValue(key);

    // When
    const result = await handler.execute(command);

    // Then
    expect(fileUploader.upload).toHaveBeenCalledWith(file);
    expect(assetRepository.save).toHaveBeenCalledWith(expect.any(Asset), {
      isNew: true,
    });
    const savedAsset = assetRepository.save.mock.calls[0][0];
    expect(savedAsset.getKey()).toBe(key);
    expect(savedAsset.getMimeType().value).toBe(file.mimetype);
    expect(result).toBe(savedAsset.getId().value);
  });

  it('should throw error if file uploader fails', async () => {
    // Given
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('test'),
      size: 4,
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };
    const command = new UploadAssetCommand(file, uploadValidationStrategy);
    fileUploader.upload.mockRejectedValue(new Error('Upload failed'));

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow('Upload failed');
  });
});
