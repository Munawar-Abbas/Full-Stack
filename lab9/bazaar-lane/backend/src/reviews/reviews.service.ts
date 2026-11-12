import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ReviewsService {
  private reviews: any[] = [];
  private nextId = 1;

  findAll() {
    return this.reviews;
  }

  create(body: any) {
    if (!body.name || !body.text) throw new BadRequestException('Name and review text are required');
    const review = {
      id: this.nextId++,
      name: body.name,
      rating: Number(body.rating) || 5,
      text: body.text,
    };
    this.reviews.unshift(review); // newest sab se upar
    return review;
  }
}
