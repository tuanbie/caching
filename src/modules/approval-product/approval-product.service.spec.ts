import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalProductService } from './approval-product.service';

describe('ApprovalProductService', () => {
  let service: ApprovalProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalProductService],
    }).compile();

    service = module.get<ApprovalProductService>(ApprovalProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
