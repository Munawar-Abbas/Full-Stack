import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart() {
    return this.cartService.getCart();
  }

  @Post()
  addItem(@Body() body: any) {
    return this.cartService.addItem(Number(body.productId), Number(body.qty) || 1);
  }

  @Patch(':productId')
  updateQty(@Param('productId', ParseIntPipe) productId: number, @Body() body: any) {
    return this.cartService.updateQty(productId, Number(body.qty));
  }

  @Delete(':productId')
  removeItem(@Param('productId', ParseIntPipe) productId: number) {
    return this.cartService.removeItem(productId);
  }
}
