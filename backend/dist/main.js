"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const origins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
        : true;
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'https://lucid-growth-email-analyzer-1.onrender.com',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const port = Number(process.env.PORT || 4000);
    await app.listen(process.env.PORT || 4000);
    console.log(`API running on :${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map