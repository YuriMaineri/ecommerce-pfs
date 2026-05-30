import { Test } from '@nestjs/testing';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { EmailAlreadyExistsError } from '../../../domain/errors/application.errors';
import { USER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { PASSWORD_HASHER } from '../../injection-tokens';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  const users: jest.Mocked<IUserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findDeleted: jest.fn(),
    restore: jest.fn(),
  };
  const hasher: jest.Mocked<IPasswordHasher> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPOSITORY, useValue: users },
        { provide: PASSWORD_HASHER, useValue: hasher },
      ],
    }).compile();
    useCase = moduleRef.get(RegisterUserUseCase);
  });

  it('registers a new user with hashed password', async () => {
    users.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue('hashed');
    const saved = new User(
      'u1',
      'Jane',
      'jane@example.com',
      'hashed',
      UserRole.CUSTOMER,
      new Date(),
    );
    users.create.mockImplementation(
      async (u) =>
        new User(
          saved.id,
          u.name,
          u.email,
          u.passwordHash,
          u.role,
          u.createdAt,
        ),
    );

    const result = await useCase.execute({
      name: 'Jane',
      email: 'Jane@Example.com',
      password: 'password123',
    });

    expect(users.findByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(hasher.hash).toHaveBeenCalledWith('password123');
    expect(users.create).toHaveBeenCalled();
    expect(result.email).toBe('jane@example.com');
    expect(result.role).toBe(UserRole.CUSTOMER);
  });

  it('throws when email already exists', async () => {
    users.findByEmail.mockResolvedValue(
      new User(
        'x',
        'X',
        'jane@example.com',
        'h',
        UserRole.CUSTOMER,
        new Date(),
      ),
    );
    await expect(
      useCase.execute({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
    expect(users.create).not.toHaveBeenCalled();
  });
});
