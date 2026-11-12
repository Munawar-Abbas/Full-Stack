import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private products: any[] = [
    { id: 1, name: 'Backpack', price: 35, emoji: '🎒', img: '', desc: 'Strong everyday backpack' },
    { id: 2, name: 'Headphones', price: 49.5, emoji: '🎧', img: '', desc: 'Wireless headphones' },
    { id: 3, name: 'Coffee Mug', price: 8, emoji: '☕', img: '', desc: 'Ceramic mug' },
  ];
  private nextId = 4;

  findAll() {
    return this.products;
  }

  findOne(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(body: any) {
    if (!body.name || body.price === undefined || body.price < 0) {
      throw new BadRequestException('Valid name and price are required');
    }
    const product = {
      id: this.nextId++,
      name: body.name,
      price: Number(body.price),
      emoji: body.emoji || '📦',
      img: body.img || '',
      desc: body.desc || '',
    };
    this.products.push(product);
    return product;
  }
}
