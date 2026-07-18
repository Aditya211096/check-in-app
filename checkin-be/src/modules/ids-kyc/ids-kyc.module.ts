import { Module } from "@nestjs/common";
import { IdsKycService } from "./ids-kyc.service";
import { IdsKycController } from "./ids-kyc.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [IdsKycController],
  providers: [IdsKycService],
  exports: [IdsKycService],
})
export class IdsKycModule {}
