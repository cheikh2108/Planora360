"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const helmet_1 = __importDefault(require("helmet"));
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
function configureApp(app) {
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
        },
        crossOriginResourcePolicy: { policy: 'same-site' },
    }));
    app.use(cookieParser());
    app.set('trust proxy', 1);
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3001')
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o && o !== '*');
    if ((process.env.FRONTEND_URL ?? '').includes('*')) {
        new common_1.Logger('CORS').warn('FRONTEND_URL contient "*" : ignoré (incompatible avec les cookies de session).');
    }
    app.enableCors({
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        },
        credentials: true,
    });
    return app;
}
//# sourceMappingURL=app.setup.js.map