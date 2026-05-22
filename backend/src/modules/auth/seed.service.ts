import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const admin = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (!admin) {
      const hashed = await bcrypt.hash('admin123', 10);
      await this.userRepository.save(
        this.userRepository.create({
          username: 'admin',
          email: 'admin@coriga.com',
          password: hashed,
          role: UserRole.ADMIN,
        }),
      );
      console.log('[Seed] Admin user created (admin / admin123)');
    }

    const user = await this.userRepository.findOne({ where: { username: 'user' } });
    if (!user) {
      const hashed = await bcrypt.hash('user123', 10);
      await this.userRepository.save(
        this.userRepository.create({
          username: 'user',
          email: 'user@coriga.com',
          password: hashed,
          role: UserRole.USER,
        }),
      );
      console.log('[Seed] Regular user created (user / user123)');
    }
  }
}
