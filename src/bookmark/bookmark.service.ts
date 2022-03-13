import { ForbiddenException, Injectable } from '@nestjs/common';
import { Bookmark, User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks({ page = 0, perPage = 20 }): Promise<Bookmark[]> {
    return await this.prisma.bookmark.findMany({
      skip: page * perPage,
      take: perPage,
    });
  }

  async getBookmarkById(id: Bookmark['id']): Promise<Bookmark> {
    return await this.prisma.bookmark.findUnique({
      where: { id },
    });
  }

  async createBookmark(userId: User['id'], bookmarkDto: CreateBookmarkDto) {
    return await this.prisma.bookmark.create({
      data: { ...bookmarkDto, userId },
    });
  }

  async editBookmark(
    userId: User['id'],
    bookmarkId: Bookmark['id'],
    bookmarkDto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: bookmarkDto,
    });
  }

  async deleteBookmark(userId: User['id'], bookmarkId: Bookmark['id']) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return this.prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
  }
}
