import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Bookmark, User } from '@prisma/client';

import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarks: BookmarkService) {}

  @Get()
  getBookmarks(@Query('page') page, @Query('perPage') perPage) {
    return this.bookmarks.getBookmarks({ page, perPage });
  }

  @Get(':id')
  getBookmark(@Param('id') bookmarkId: string) {
    return this.bookmarks.getBookmarkById(Number(bookmarkId));
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: User['id'],
    @Body() createBookmarkDto: CreateBookmarkDto,
  ) {
    return this.bookmarks.createBookmark(userId, createBookmarkDto);
  }

  @Put(':id')
  editBookmark(
    @GetUser('id') userId: User['id'],
    @Param('id') bookmarkId: Bookmark['id'],
    @Body() editBookmarkDto: EditBookmarkDto,
  ) {
    return this.bookmarks.editBookmark(userId, bookmarkId, editBookmarkDto);
  }

  @Delete(':id')
  deleteBookmark(
    @GetUser('id') userId: User['id'],
    @Param('id') bookmarkId: Bookmark['id'],
  ) {
    return this.bookmarks.deleteBookmark(userId, bookmarkId);
  }
}
