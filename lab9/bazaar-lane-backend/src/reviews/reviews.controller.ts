import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.reviewsService.create(body);
  }
}
