"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const origins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
        : true;
    app.enableCors({ origin: origins });
    const port = Number(process.env.PORT || 4000);
    await app.listen(port);
    console.log(`API running on :${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map