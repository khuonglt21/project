import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && !data.hasOwnProperty('success')) {
          const ctx = context.switchToHttp();
          const response = ctx.getResponse();
          response.json({
            success: true,
            message: 'Successful',
            data,
            statusCode: response.statusCode || HttpStatus.OK,
          });
        }
      }),
    );
  }
}
