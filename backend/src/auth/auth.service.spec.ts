import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { Repository } from 'typeorm';
import type { User } from '../entities/index.js';
import { AuthService } from './auth.service.js';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: bcrypt.hashSync('password123', 4),
    weight: null,
    height: null,
    age: null,
    gender: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('AuthService', () => {
  let users: {
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let service: AuthService;

  beforeEach(() => {
    users = {
      findOne: vi.fn(),
      save: vi.fn(async (u: Partial<User>) =>
        Object.assign(makeUser(), u, { id: 7 }),
      ),
      create: vi.fn((u: Partial<User>) => u),
    };
    service = new AuthService(
      users as unknown as Repository<User>,
      new JwtService({ secret: 'test-secret-test-secret' }),
    );
  });

  it('logs in with the right password and never exposes the hash', async () => {
    users.findOne.mockResolvedValue(makeUser());
    const user = await service.login({
      username: 'testuser',
      password: 'password123',
    });
    expect(user).toEqual({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      createdAt: expect.any(Date),
    });
  });

  it('accepts $2y$ hashes created by the old PHP backend', async () => {
    const phpHash = bcrypt
      .hashSync('password123', 4)
      .replace(/^\$2b\$/, '$2y$');
    users.findOne.mockResolvedValue(makeUser({ passwordHash: phpHash }));
    await expect(
      service.login({ username: 'testuser', password: 'password123' }),
    ).resolves.toMatchObject({ id: 1 });
  });

  it('rejects a wrong password or unknown user with the same error', async () => {
    users.findOne.mockResolvedValueOnce(makeUser());
    await expect(
      service.login({ username: 'testuser', password: 'nope' }),
    ).rejects.toThrow(
      new UnauthorizedException('Invalid username or password'),
    );

    users.findOne.mockResolvedValueOnce(null);
    await expect(
      service.login({ username: 'ghost', password: 'password123' }),
    ).rejects.toThrow(
      new UnauthorizedException('Invalid username or password'),
    );
  });

  it('refuses to register a taken username or email', async () => {
    users.findOne.mockResolvedValue(makeUser());
    await expect(
      service.register({
        username: 'testuser',
        email: 'new@example.com',
        password: 'secret1',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(users.save).not.toHaveBeenCalled();
  });

  it('hashes the password on register', async () => {
    users.findOne.mockResolvedValue(null);
    const user = await service.register({
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret1',
    });
    expect(user.id).toBe(7);
    const saved = users.save.mock.calls[0][0] as Partial<User>;
    expect(saved.passwordHash).not.toBe('secret1');
    expect(await bcrypt.compare('secret1', saved.passwordHash!)).toBe(true);
  });

  it('round-trips a signed token', async () => {
    const token = await service.signToken({
      id: 3,
      username: 'alice',
      email: 'a@b.c',
      createdAt: new Date(),
    });
    await expect(service.verifyToken(token)).resolves.toMatchObject({
      sub: 3,
      username: 'alice',
    });
    await expect(service.verifyToken(`${token}x`)).resolves.toBeNull();
  });
});
