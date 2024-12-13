import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../product';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-product-dialog',
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class EditProductDialogComponent {
  productForm: FormGroup;


  constructor(
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      _id: [data._id],
      productId: [data.productId],
      name: [data.name, Validators.required],
      description: [data.description],
      price: [data.price, [Validators.required, Validators.min(0)]],
      stock: [data.stock, [Validators.required, Validators.min(0)]],
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }


  onSave(): void {
    if (this.productForm.valid) {
      const updatedProduct: Product = this.productForm.value;
      this.dialogRef.close(updatedProduct);
    }
  }
}


