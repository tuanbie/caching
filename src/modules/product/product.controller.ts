import { Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { FilterProductDto } from './dtos/filter-product.dto';
import { RestMethod } from '@common/decorators/rest-method.decorator';

@CustomController('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'GET',
    path: 'all',
    summary: 'Get all product (Role: admin | campus)',
  })
  getAll(@Query() query: FilterProductDto) {
    return this.productService.getAll(query);
  }
}
