import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Product, ProductSyncRequest } from './product';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddProductDialogComponent } from './add-product-dialog/add-product-dialog.component';
import { EditProductDialogComponent } from './edit-product-dialog/edit-product-dialog.component';
import { ProductService } from './services/product.service';
import * as signalR from '@microsoft/signalr';
import { ProductPouchdbService } from '../services/product-pouchdb.service';
import { ProductOfflineChangeService } from '../services/product-offline-change.service';


@Component({
  selector: 'app-product',
  imports: [ CommonModule, MatTableModule, MatIcon, MatButtonModule,
    MatDialogModule, AddProductDialogComponent, EditProductDialogComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  displayedColumns: string[] = ['name', 'description', 'price', 'stock', 'action'];
  dataSource: Product[] = [];
  private productService = inject(ProductService);
  private productPouchdbService = inject(ProductPouchdbService);
  private productOfflineChangeService = inject(ProductOfflineChangeService);
  //This is not needed if when you use user email which can be sent in your SignalR connection / you can create a hub group.
  private addInProgress = false;
  private updateInProgress = false;
  private deleteInProgress = false;
  //This is not needed if when you use user email which can be sent in your SignalR connection / you can create a hub group.
  private hubConnection!: signalR.HubConnection;
  private offlineAddedProducts: Product[] = [];
  private offlineUpdatedProducts: Product[] = [];
  private offlineDeletedProducts: Product[] = [];


  constructor(private dialog: MatDialog) {}


  @HostListener('window:online', ['$event'])
  async onOnline(): Promise<void> {
    console.log('online!');
    console.log(await this.productOfflineChangeService.getAllProducts());
    this.offlineAddedProducts = await this.productOfflineChangeService.getAddedProducts();
    this.offlineUpdatedProducts = await this.productOfflineChangeService.getUpdatedProducts();
    this.startConnection();
    this.syncProducts();
  }


  @HostListener('window:offline', ['$event'])
  onOffline(): void {
    console.log('offline!');
    this.hubConnection.stop();
  }


  ngOnInit(): void {
    this.initialize();
    if (navigator.onLine) {
      this.startConnection();
    }
  }


  addProduct(): void {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '600px',
      height: '600px',
    });


    dialogRef.afterClosed().subscribe((result: Product | undefined) => {
      if (result) {
        if (!navigator.onLine) {
          const added = {
              ...result,
              isAdded: true
          };
          this.productPouchdbService.addOrUpdateProduct(added);
          if (!this.dataSource.find(p => p.productId === result.productId)) {
            result.productId = added.productId;
            this.dataSource = [...this.dataSource, result];
        }
        }
        else {
          this.addInProgress = true;
          this.productService.addProduct(result).subscribe({ next : response => {
            if (!this.dataSource.find(p => p.productId === response.productId)) {
                this.productPouchdbService.addOrUpdateProduct(response);
                this.dataSource = [...this.dataSource, response];
            }
            this.addInProgress = false;
          }, error: () => {
            this.addInProgress = false;
          }});
        }
      }
    });
  }


  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '600px',
      height: '600px',
      data: product,
    });


    dialogRef.afterClosed().subscribe((result: Product | undefined) => {
      if (result) {
        if (!navigator.onLine) {
          const updated = {
              ...result,
              isUpdated: true
          };
          const index = this.dataSource.findIndex(p => p.productId === result.productId);
          if (index !== -1) {
            this.productPouchdbService.addOrUpdateProduct(updated);
            const updatedData = [...this.dataSource];
            updatedData[index] = result;
            this.dataSource = updatedData;
          }
        }
        else {
          this.updateInProgress = true;
          this.productService.updateProduct(result).subscribe({ next : response => {
            const index = this.dataSource.findIndex(p => p.productId === product.productId);
            if (index !== -1) {
              this.productPouchdbService.addOrUpdateProduct(response);
              const updatedData = [...this.dataSource];
              updatedData[index] = response;
              this.dataSource = updatedData;
            }
            this.updateInProgress = false;
          }, error : () => {
            this.updateInProgress = false;
          } });
        }
      }
    });
  }


  deleteProduct(product: Product): void {
    if (!navigator.onLine) {
      const deleted = {
          ...product,
          isDeleted: true
      };
      this.offlineDeletedProducts.push(deleted);
      this.productPouchdbService.removeProduct(product);
      this.dataSource = this.dataSource.filter(p => p.productId !== product.productId);
    }
    else {
      this.deleteInProgress = true;
      this.productService.deleteProduct(product.productId as string).subscribe({ next: () => {
        this.productPouchdbService.removeProduct(product);
        this.dataSource = this.dataSource.filter(p => p.productId !== product.productId);
        this.deleteInProgress = false;
      }, error : () => {
        this.deleteInProgress = false;
      } });
    }
  }


  private initialize(): void {


    this.productPouchdbService.getAllProducts().subscribe({
      next: (products) => {
        if (products && products.length) {
          this.productService.getProductIds().subscribe({
            next: (response) => {
              const productIds = products.map(x => x.productId);


              if(this.areArraysEqual(response, productIds)) {
                this.dataSource = products;
              }
              else {
                this.getDataFromAPI();
              }


          }, error: () => {
            this.dataSource = products;
          } });


        } else {
          this.getDataFromAPI();
        }
      },
      error: (err) => {
        this.getDataFromAPI();
      }
    });
  }


  private areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    const set2 = new Set(arr2);
    return arr1.every(item => set2.has(item));
  }


  private getDataFromAPI(): void {
    this.productService.getProducts().subscribe(async response => {
      await this.productPouchdbService.resetDatabase();
      this.dataSource = response;
      response.forEach(product => {
        this.productPouchdbService.addProducts(product);
      });
    });
  }


  private syncProducts(): void {
    if (this.offlineAddedProducts?.length ||
        this.offlineUpdatedProducts?.length ||
        this.offlineDeletedProducts?.length) {
         
          const syncRequest = {
            addedProducts: this.offlineAddedProducts,
            updatedProducts: this.offlineUpdatedProducts,
            deletedProducts: this.offlineDeletedProducts
          } as ProductSyncRequest;


          this.productService.syncProducts(syncRequest).subscribe(async response => {
              await this.productPouchdbService.resetDatabase();
              response.forEach(product => {
                this.productPouchdbService.addProducts(product);
              });
              this.dataSource = response;
          });
    }
    else {
      this.initialize();
    }
  }


  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:7047/notifications/product')
      .withAutomaticReconnect()
      .build();


    this.hubConnection
      .start()
      .then(() => {
        this.registerOnServerEvents();
      })
      .catch((err) => console.error('SignalR connection error:', err));
  }


  private registerOnServerEvents(): void {
    this.hubConnection.on('ProductAdded', (addedProduct) => {
      if (!this.dataSource.find(p => p.productId === addedProduct.productId) && !this.addInProgress) {
          this.productPouchdbService.addOrUpdateProduct(addedProduct);
          this.dataSource = [...this.dataSource, addedProduct];
      }
    });


    this.hubConnection.on('ProductUpdated', (updatedProduct) => {
      const index = this.dataSource.findIndex(p => p.productId === updatedProduct.productId);
      if (index !== -1 && !this.updateInProgress) {
        this.productPouchdbService.addOrUpdateProduct(updatedProduct);
        const updatedData = [...this.dataSource];
        updatedData[index] = updatedProduct;
        this.dataSource = updatedData;
      }
    });


    this.hubConnection.on('ProductDeleted', (deletedProduct) => {
      if(!this.deleteInProgress) {
        this.productPouchdbService.removeProduct(deletedProduct);
        this.dataSource = this.dataSource.filter(p => p.productId !== deletedProduct.productId);
      }
    });
  }




}






