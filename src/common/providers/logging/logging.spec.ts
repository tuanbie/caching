import { Test, TestingModule } from '@nestjs/testing';
import { Logging } from './logging';

describe('Logging', () => {
  let provider: Logging;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Logging],
    }).compile();

    provider = module.get<Logging>(Logging);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
