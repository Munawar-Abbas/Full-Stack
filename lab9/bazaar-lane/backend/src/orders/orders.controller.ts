import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  placeOrder(@Body() body: any) {
    return this.ordersService.placeOrder(body);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }
}
