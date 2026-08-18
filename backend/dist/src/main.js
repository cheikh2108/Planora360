"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3001')
        .split(',')
        .map(o => o.trim());
    app.enableCors({
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                cb(null, true);
            }
            else {
                cb(new Error(`CORS: origin ${origin} not allowed`));
            }
        },
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map