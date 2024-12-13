import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import { ProductPouchdbService } from './product-pouchdb.service';
PouchDB.plugin(PouchFind);


@Injectable({
  providedIn: 'root'
})
export class ProductOfflineChangeService {


  private db: PouchDB.Database<any>;


  constructor(private productPouchdbService: ProductPouchdbService) {
    this.db = productPouchdbService.getDB();
  }


  async getAddedProducts(): Promise<any> {
    const response = await this.db.find({
        selector: { isAdded: true }
      });


      return Promise.resolve(response.docs);
  }


  async getUpdatedProducts(): Promise<any> {
    const response = await this.db.find({
        selector: { isUpdated: true }
      });
     
      return Promise.resolve(response.docs);
  }


  async getAllProducts(): Promise<any[]> {
    return await (await this.db.allDocs({ include_docs: true })).rows.map((row: any) => row.doc);
  }


}
