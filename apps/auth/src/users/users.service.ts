import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const session = await this.usersRepository.startTransaction();

    try {
      const user = await this.usersRepository.create(
        {
          ...createUserDto,
          password: bcrypt.hashSync(createUserDto.password, 10),
        },
        { session },
      );

      await session.commitTransaction();

      return user;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const passportIsValid = bcrypt.compareSync(password, user?.password);

    if (!passportIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
