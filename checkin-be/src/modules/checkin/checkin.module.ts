import { Module } from "@nestjs/common";
import { CheckInService } from "./checkin.service";
import { CheckInController } from "./checkin.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}
