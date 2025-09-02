"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error', 'warn', 'log', 'debug'] });
    const frontendUrl = process.env.FRONTEND_URL || '*';
    app.enableCors({
        origin: frontendUrl,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const port = parseInt(process.env.PORT || '4000', 10);
    await app.listen(port);
    common_1.Logger.log(`NestJS server listening on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map