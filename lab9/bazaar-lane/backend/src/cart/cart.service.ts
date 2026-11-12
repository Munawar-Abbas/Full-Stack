import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  private cart: { productId: number; qty: number }[] = [];

  constructor(private readonly productsService: ProductsService) {}

  getCart() {
    const items = this.cart.map((item) => {
      const product = this.productsService.findOne(item.productId);
      return { ...item, product, subtotal: product.price * item.qty };
    });
    const total = items.reduce((sum, i) => sum + i.subtotal, 0);
    return { items, total };
  }

  addItem(productId: number, qty = 1) {
    this.productsService.findOne(productId); // product exist karta hai ya nahi
    const existing = this.cart.find((i) => i.productId === productId);
    if (existing) existing.qty += qty;
    else this.cart.push({ productId, qty });
    return this.getCart();
  }

  updateQty(productId: number, qty: number) {
    const item = this.cart.find((i) => i.productId === productId);
    if (!item) throw new NotFoundException('Item not in cart');
    if (qty <= 0) return this.removeItem(productId);
    item.qty = qty;
    return this.getCart();
  }

  removeItem(productId: number) {
    this.cart = this.cart.filter((i) => i.productId !== productId);
    return this.getCart();
  }

  clear() {
    this.cart = [];
  }
}
