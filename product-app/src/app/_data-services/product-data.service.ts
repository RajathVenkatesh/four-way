import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product, ProductSyncRequest } from '../product/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {

  private apiUrl = 'http://localhost:7047/api/product';

  constructor(private http: HttpClient) {}

  getProductIds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/ids`);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }


  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }


  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.productId}`, product);
  }


  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);``
  }


  syncProducts(productSyncRequest: ProductSyncRequest): Observable<Product[]> {
    return this.http.put<Product[]>(`${this.apiUrl}/syncProducts`, productSyncRequest);
  }


}