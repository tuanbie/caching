import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalProductController } from './approval-product.controller';
import { ApprovalProductService } from './approval-product.service';

describe('ApprovalProductController', () => {
  let controller: ApprovalProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprovalProductController],
      providers: [ApprovalProductService],
    }).compile();

    controller = module.get<ApprovalProductController>(ApprovalProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
