import { Injectable } from '@angular/core';
import { ProductDataService } from '../../_data-services/product-data.service';
import { Product, ProductSyncRequest } from '../product';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {


  constructor(private productDataService: ProductDataService) {}


  getProductIds(): Observable<string[]> {
    return this.productDataService.getProductIds();
  }


  getProducts(): Observable<Product[]> {
    return this.productDataService.getProducts();
  }


  addProduct(product: Product): Observable<Product> {
    return this.productDataService.addProduct(product);
  }


  updateProduct(product: Product): Observable<Product> {
    return this.productDataService.updateProduct(product);
  }


  deleteProduct(id: string): Observable<void> {
    return this.productDataService.deleteProduct(id);
  }


  syncProducts(productSyncRequest: ProductSyncRequest): Observable<Product[]> {
    return this.productDataService.syncProducts(productSyncRequest);
  }
}






