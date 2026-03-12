import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { InviteUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findAllByCompany(companyId: string): Promise<User[]> {
    return this.usersRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
    });
  }

  async findOne(id: string, companyId: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id, companyId },
      select: ['id', 'name', 'email', 'role', 'isActive', 'avatarUrl', 'lastLoginAt', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async invite(dto: InviteUserDto, companyId: string, invitedById: string): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    // Generate a temporary password (user will reset on first login)
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = this.usersRepo.create({
      ...dto,
      passwordHash,
      companyId,
      invitedBy: invitedById,
    });
    const saved = await this.usersRepo.save(user);

    // TODO: Send invitation email with temp password via notification service

    const { passwordHash: _, refreshTokenHash: __, ...result } = saved;
    return result as User;
  }

  async update(id: string, companyId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id, companyId);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const user = await this.findOne(id, companyId);
    await this.usersRepo.remove(user);
  }
}
