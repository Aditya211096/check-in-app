import { Controller, Get, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, Res } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IdsKycService } from "./ids-kyc.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("kyc")
export class IdsKycController {
  constructor(private readonly kycService: IdsKycService) {}

  @Post("upload-url")
  @UseGuards(JwtAuthGuard)
  async getUploadUrl(@Body() body: { originalName: string; contentType: string }, @Req() req: any) {
    return this.kycService.getUploadUrl(req.user.sub, body.originalName, body.contentType);
  }

  @Post("submit")
  @UseGuards(JwtAuthGuard)
  async submitKyc(@Body() body: { docType: string; gcsObject: string; fileHash: string }, @Req() req: any) {
    return this.kycService.submitKyc(req.user.sub, body.docType, body.gcsObject, body.fileHash);
  }

  @Get("status")
  @UseGuards(JwtAuthGuard)
  async getKycStatus(@Req() req: any) {
    return this.kycService.getKycStatus(req.user.sub);
  }

  // Developer mode local file upload endpoint
  @Post("local-upload-fallback")
  @UseInterceptors(FileInterceptor("file"))
  async uploadLocalFallback(@UploadedFile() file: any, @Body() body: { filename?: string }) {
    const filename = body.filename || file.originalname || "upload.jpg";
    return this.kycService.saveLocalFile(filename, file.buffer);
  }

  // Serve local files for preview in dev mode
  @Get("view-local/:filename")
  async viewLocalFile(@Param("filename") filename: string, @Res() res: any) {
    const filePath = this.kycService.getLocalFilePath(filename);
    return res.sendFile(filePath);
  }
}
