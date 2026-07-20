import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://aditya211096.github.io",
      ...(process.env.ALLOWED_ORIGINS?.split(",") ?? []),
    ],
    credentials: true,
  });
  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, "0.0.0.0");
  console.log(`Backend running on port ${port} bound to 0.0.0.0`);
}
bootstrap();

