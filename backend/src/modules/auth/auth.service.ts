import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { PaginatedResult } from '../../dtos/pagination';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string, role: UserRole = UserRole.USER) {
    const existing = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existing) {
      throw new ConflictException('Username or email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
    const saved = await this.userRepository.save(user);
    return this.generateToken(saved);
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user);
  }

  async getProfile(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...profile } = user;
    return profile;
  }

  async findAllUsers(search?: string, page = 1, limit = 20): Promise<PaginatedResult<Partial<User>>> {
    const qb = this.userRepository.createQueryBuilder('user');
    if (search) {
      qb.where('user.username LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
    }
    qb.orderBy('user.username', 'ASC');
    const total = await qb.getCount();
    const users = await qb.skip((page - 1) * limit).take(limit).getMany();
    const data = users.map(({ password, ...u }) => u);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...profile } = user;
    return profile;
  }

  async createUser(username: string, email: string, password: string, role: UserRole = UserRole.USER) {
    const existing = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existing) {
      throw new ConflictException('Username or email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ username, email, password: hashedPassword, role });
    const saved = await this.userRepository.save(user);
    const { password: _, ...result } = saved;
    return result;
  }

  async updateUser(id: number, data: { username?: string; email?: string; password?: string; role?: UserRole }) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (data.username !== undefined) user.username = data.username;
    if (data.email !== undefined) user.email = data.email;
    if (data.password) user.password = await bcrypt.hash(data.password, 10);
    if (data.role !== undefined) user.role = data.role;
    const saved = await this.userRepository.save(user);
    const { password: _, ...result } = saved;
    return result;
  }

  async removeUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(id);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
