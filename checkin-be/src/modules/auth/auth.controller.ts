import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";

class VerifyTokenDto {
  token?: string;
  idToken?: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("verify")
  @HttpCode(HttpStatus.OK)
  async verify(@Body() body: VerifyTokenDto) {
    const tokenToVerify = body.idToken || body.token;
    if (!tokenToVerify) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Authentication token (idToken or token) is required.",
      };
    }
    return this.authService.verifyFirebaseToken(tokenToVerify);
  }
}
