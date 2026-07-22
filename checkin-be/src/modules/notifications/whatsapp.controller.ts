import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, ForbiddenException } from '@nestjs/common';

@Controller('notifications/whatsapp')
export class WhatsAppWebhookController {
  
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string
  ) {
    const localVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "traces_sunrise_verify_token_192837";
    if (mode === 'subscribe' && token === localVerifyToken) {
      return challenge;
    }
    throw new ForbiddenException('Invalid webhook verification token.');
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhookEvents(@Body() payload: any) {
    if (payload.object === 'whatsapp_business_account' && payload.entry) {
      for (const entry of payload.entry) {
        const changes = entry.changes;
        if (changes && changes[0]?.value?.messages) {
          const incomingMessage = changes[0].value.messages[0];
          const senderPhone = incomingMessage.from;
          const messageText = incomingMessage.text?.body;
          
          console.log(`Received WhatsApp message from ${senderPhone}: ${messageText}`);
          // Add custom trigger processing logic here if needed
        }
      }
    }
    return { status: 'EVENT_RECEIVED' };
  }
}
