import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDTO } from './DTO/userUpdate.dto';
import * as bcrypt from 'bcrypt';

//TODO set in .env
export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getList() {
    return await this.prisma.user.findMany({
      select: { id: true, pseudo: true },
      where: { isActive: true },
    });
  }

  async getOne(id: number, additionnalFields?: object): Promise<UserEntity> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, pseudo: true, isActive: true, ...additionnalFields },
    });
  }

  async getCandidates() {
    return await this.prisma.user.findMany({
      select: { id: true, pseudo: true },
      where: { isActive: false },
    });
  }

  async updateMe(id: number, data: UpdateUserDTO): Promise<UserEntity> {
    const newData = {};
    if (data.actualPassword) {
      const crypt = await bcrypt.hash(data.actualPassword, roundsOfHashing);
      const storedCrypt = (
        await this.prisma.user.findUnique({
          where: { id },
          select: { password: true },
        })
      ).password;
      if (await bcrypt.compare(crypt, storedCrypt)) {
        throw new BadRequestException('Le mot de passe actuel est invalide');
      }
      if (!data.newPassword || !data.newPasswordConfirm) {
        throw new BadRequestException(
          'Pour changer de mot de passe, vous devez renseigner le nouveau mot de passe et le confirmer',
        );
      }
      if (data.newPassword !== data.newPasswordConfirm) {
        throw new BadRequestException(
          'Le nouveau mot de passe et la confirmation sont différents',
        );
      }
      Object.defineProperty(newData, 'password', { value: crypt });
    }
    if (data.pseudo) {
      Object.defineProperty(newData, 'pseudo', { value: data.pseudo });
    }
    const newUser = await this.prisma.user.update({
      where: { id },
      data: newData,
    });
    return { id: newUser.id, pseudo: newUser.pseudo, email: newUser.email };
  }
}
