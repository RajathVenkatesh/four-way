export interface Product {
    _id: string;
    productId: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    action: boolean;
}


export interface ProductSyncRequest {
    addedProducts : Product[];
    updatedProducts : Product[];
    deletedProducts : Product[];
}


