/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { OutboxService } from '../outbox.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBus } from '@nestjs/cqrs';
import { OutboxStatus } from '@prisma/client';

describe('OutboxService', () => {
  let service: OutboxService;
  let prisma: jest.Mocked<PrismaService>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(async () => {
    const mockPrisma: any = {
      $transaction: jest.fn(async (cb: any) => {
        if (typeof cb === 'function') {
          return cb(mockPrisma);
        }
        return cb;
      }),
      $queryRaw: jest.fn(),
      outboxMessage: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
    prisma = module.get(PrismaService);
    eventBus = module.get(EventBus);
  });

  describe('emitPending', () => {
    it('should emit pending messages (using Prisma Client - new implementation)', async () => {
      const mockMessages = [
        {
          id: '1',
          type: 'test.event',
          payload: { foo: 'bar' },
          status: OutboxStatus.PENDING,
          attemptCount: 0,
          headers: {},
        } as any,
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockMessages);
      (prisma.outboxMessage.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await service.emitPending();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalled();
      expect(prisma.outboxMessage.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1', status: OutboxStatus.PROCESSING },
          data: expect.objectContaining({
            status: OutboxStatus.SENT,
          }),
        }),
      );
    });

    it('should not emit if no messages found', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      await service.emitPending();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(prisma.outboxMessage.updateMany).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
});
