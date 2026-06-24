import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(usuario: string, password: string) {
    const user = await this.prisma.usuario.findFirst({
      where: { usuario, estado: 'activo' },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const payload = {
      sub: user.idUsuario,
      usuario: user.usuario,
      rol: user.rol,
      nombres: user.nombres,
      apellidos: user.apellidos,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }
}
