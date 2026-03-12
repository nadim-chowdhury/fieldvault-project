import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { InviteUserDto, UpdateUserDto } from './dto/user.dto';
import { EmailService } from '../auth/services/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async findAllByCompany(
    companyId: string,
    options?: { page?: number; limit?: number },
  ) {
    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await this.usersRepo.findAndCount({
      where: { companyId },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
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

    // Send invitation email with temp password
    try {
      const company = await this.usersRepo
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.company', 'c')
        .where('u.id = :id', { id: invitedById })
        .getOne();
      const companyName = company?.company?.name || 'FieldVault';
      await this.emailService.sendInvitationEmail(dto.email, companyName, tempPassword);
    } catch {
      // Log but don't fail the invitation if email fails
    }

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

