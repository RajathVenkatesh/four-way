import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Observable, from } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductPouchdbService {
  private db: PouchDB.Database<any>;


  constructor() {
    this.db = new PouchDB('products_db');
  }


  async addOrUpdateProduct(product: any): Promise<any> {
    if (product) {
      product = {
        ...product,
        _id: product.productId
      };


      if (!!product.productId) {
        let updatedProduct = await this.db.get(product.productId);
        updatedProduct = {
          ...product,
          _rev: updatedProduct._rev,
          isUpdated: product.isUpdated
        };
        return this.db.put(updatedProduct);
      }
      else {
        product.productId = crypto.randomUUID();
        product = {
          ...product,
          _id: product.productId
        };
        return this.db.put(product);
      }
    }
  }


  addProducts(product: any): any {
    product = {
      ...product,
      _id: product.productId
    };
    this.db.put(product);
  }


  removeProduct(product: any): void {
    if (product) {
      this.db.get(product.productId).then(document => {
        if(!!document) {
          this.db.remove(document);
        }
      });
    }
  }


  getAllProducts(): Observable<any[]> {
    return from(
      this.db.allDocs({ include_docs: true })
        .then((result: any) => result.rows.map((row: any) => row.doc))
    );
  }


  getDB(): PouchDB.Database<any> {
    return this.db;
  }


  async resetDatabase(): Promise<void> {
    const allDocs =  await this.db.allDocs({ include_docs: true });
 
      const docsToDelete = allDocs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true
      }));


      if (!!docsToDelete.length) {
          await this.db.bulkDocs(docsToDelete);
      }
 
  }


 
 
}






