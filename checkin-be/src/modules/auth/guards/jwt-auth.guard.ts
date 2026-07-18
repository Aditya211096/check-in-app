import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authorization bearer token is missing.");
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || "traces_sunrise_jwt_secret_token_198273",
      });
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Session token is invalid or expired.");
    }
  }
}
