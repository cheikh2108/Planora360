import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Injecte organizationId depuis le JWT dans request pour usage dans les services.
 * Le filtrage réel se fait dans chaque service via PrismaService avec where: { organizationId }.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.user?.organizationId) {
      request.organizationId = request.user.organizationId;
    }
    return next.handle();
  }
}
