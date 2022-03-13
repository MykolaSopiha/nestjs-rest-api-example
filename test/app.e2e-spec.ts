import * as pactum from 'pactum';
import {
  HttpCode,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const port = 3333;
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(port);

    prisma = app.get(PrismaService);
    await prisma.clearDb();

    pactum.request.setBaseUrl(`http://localhost:${port}`);
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const authDto = {
      email: 'test@test.com',
      password: '123123',
    };

    it('should return 400 when sign up with only email', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody({
          email: authDto.email,
        })
        .expectStatus(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when sign up with only password', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody({
          password: authDto.password,
        })
        .expectStatus(HttpStatus.BAD_REQUEST);
    });

    it('should sign up', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody(authDto)
        .expectStatus(HttpStatus.CREATED);
    });

    it('should sign in', () => {
      return pactum
        .spec()
        .post('/auth/signin')
        .withBody(authDto)
        .expectStatus(HttpStatus.CREATED);
    });
  });
});
