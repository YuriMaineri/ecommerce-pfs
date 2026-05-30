import { Test } from '@nestjs/testing';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ForbiddenAccessError } from '../../../domain/errors/application.errors';
import { USER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { PASSWORD_HASHER } from '../../injection-tokens';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { UpdateUserUseCase } from './update-user.use-case';

function makeUser(id: string, role: UserRole, email = `${id}@example.com`): User {
  return new User(id, `Name ${id}`, email, 'hashed', role, new Date());
}

describe('UpdateUserUseCase (role rules)', () => {
  let useCase: UpdateUserUseCase;
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
        UpdateUserUseCase,
        { provide: USER_REPOSITORY, useValue: users },
        { provide: PASSWORD_HASHER, useValue: hasher },
      ],
    }).compile();
    useCase = moduleRef.get(UpdateUserUseCase);
    // update por padrao apenas ecoa os dados aplicados sobre o usuario alvo.
    users.update.mockImplementation(async (id, data) => {
      const base = makeUser(id, data.role ?? UserRole.CUSTOMER);
      return new User(
        base.id,
        data.name ?? base.name,
        data.email ?? base.email,
        base.passwordHash,
        data.role ?? base.role,
        base.createdAt,
      );
    });
  });

  it('ADMIN promove um CUSTOMER para ADMIN', async () => {
    users.findById.mockResolvedValue(makeUser('u2', UserRole.CUSTOMER));

    const result = await useCase.execute({
      id: 'u2',
      role: UserRole.ADMIN,
      actorUserId: 'admin1',
      actorRole: UserRole.ADMIN,
    });

    expect(users.update).toHaveBeenCalledWith(
      'u2',
      expect.objectContaining({ role: UserRole.ADMIN }),
    );
    expect(result.role).toBe(UserRole.ADMIN);
  });

  it('ADMIN rebaixa outro ADMIN para CUSTOMER', async () => {
    users.findById.mockResolvedValue(makeUser('u3', UserRole.ADMIN));

    const result = await useCase.execute({
      id: 'u3',
      role: UserRole.CUSTOMER,
      actorUserId: 'admin1',
      actorRole: UserRole.ADMIN,
    });

    expect(users.update).toHaveBeenCalledWith(
      'u3',
      expect.objectContaining({ role: UserRole.CUSTOMER }),
    );
    expect(result.role).toBe(UserRole.CUSTOMER);
  });

  it('CUSTOMER nao pode alterar o proprio papel (auto-promocao bloqueada)', async () => {
    users.findById.mockResolvedValue(makeUser('c1', UserRole.CUSTOMER));

    await expect(
      useCase.execute({
        id: 'c1',
        role: UserRole.ADMIN,
        actorUserId: 'c1',
        actorRole: UserRole.CUSTOMER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenAccessError);
    expect(users.update).not.toHaveBeenCalled();
  });

  it('ADMIN nao pode rebaixar a propria conta', async () => {
    users.findById.mockResolvedValue(makeUser('admin1', UserRole.ADMIN));

    await expect(
      useCase.execute({
        id: 'admin1',
        role: UserRole.CUSTOMER,
        actorUserId: 'admin1',
        actorRole: UserRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenAccessError);
    expect(users.update).not.toHaveBeenCalled();
  });

  it('atualiza nome sem mexer no papel quando role nao e enviado', async () => {
    users.findById.mockResolvedValue(makeUser('u4', UserRole.CUSTOMER));

    await useCase.execute({
      id: 'u4',
      name: 'Novo Nome',
      actorUserId: 'admin1',
      actorRole: UserRole.ADMIN,
    });

    const [, data] = users.update.mock.calls[0];
    expect(data.name).toBe('Novo Nome');
    expect(data.role).toBeUndefined();
  });
});
