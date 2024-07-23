import { CountryService } from './country.service';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { RestMethod } from '@common/decorators/rest-method.decorator';

@CustomController('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @RestMethod({
    method: 'GET',
    summary: 'Get all country',
  })
  getAllCountries() {
    return this.countryService.getAllCountries();
  }
}
