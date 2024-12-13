import { TestBed } from '@angular/core/testing';


import { ProductPouchdbService } from './product-pouchdb.service';


describe('ProductPouchdbService', () => {
  let service: ProductPouchdbService;


  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductPouchdbService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});






