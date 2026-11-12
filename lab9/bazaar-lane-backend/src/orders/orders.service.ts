import { BadRequestException, Injectable } from '@nestjs/common';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  private orders: any[] = [];
  private nextId = 1;

  constructor(private readonly cartService: CartService) {}

  placeOrder(body: any) {
    const { name, phone, address, payment } = body;
    if (!name || !phone || !address) {
      throw new BadRequestException('Name, phone and address are required');
    }

    const cart = this.cartService.getCart();
    if (cart.items.length === 0) throw new BadRequestException('Cart is empty');

    const order = {
      id: this.nextId++,
      name,
      phone,
      address,
      payment: payment || 'Cash on delivery',
      items: cart.items,
      total: cart.total,
      date: new Date(),
    };
    this.orders.push(order);
    this.cartService.clear(); // order ke baad cart khali
    return order;
  }

  findAll() {
    return this.orders;
  }
}
