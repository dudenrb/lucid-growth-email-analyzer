"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const port = Number(config.get('PORT') || 4000);
    app.enableCors({
        origin: config.get('CORS_ORIGIN')?.split(',').map((s) => s.trim()) ?? true,
        credentials: true,
    });
    app.useGlobalFilters({
        catch(exception, host) {
            console.error('Unhandled Exception:', exception);
            throw exception;
        },
    });
    await app.listen(port);
    console.log(`API running on :${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map