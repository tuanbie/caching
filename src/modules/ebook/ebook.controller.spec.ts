import { Test, TestingModule } from '@nestjs/testing';
import { EbookController } from './ebook.controller';
import { EbookService } from './ebook.service';

describe('EbookController', () => {
  let controller: EbookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EbookController],
      providers: [EbookService],
    }).compile();

    controller = module.get<EbookController>(EbookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
