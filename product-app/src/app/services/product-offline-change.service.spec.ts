import { TestBed } from '@angular/core/testing';
import { ProductOfflineChangeService } from './product-offline-change.service';


describe('ProductOfflineChangeService', () => {
  let service: ProductOfflineChangeService;


  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductOfflineChangeService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
