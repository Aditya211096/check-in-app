import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { TenantGuard } from "./guards/tenant.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "traces_sunrise_jwt_secret_token_198273",
      signOptions: { expiresIn: "30d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, TenantGuard],
  exports: [AuthService, JwtAuthGuard, TenantGuard, JwtModule],
})
export class AuthModule {}
