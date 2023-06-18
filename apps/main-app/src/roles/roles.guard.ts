import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const set = new Set<number>(
      this.reflector.getAllAndOverride<number[]>('roles', [
        context.getClass(),
      ]) ?? [],
    );

    (
      this.reflector.getAllAndOverride<number[]>('roles', [
        context.getHandler(),
      ]) ?? []
    ).forEach((e) => {
      set.add(e);
    });

    if (set.size == 0) return true;

    const request = context.switchToHttp().getRequest();
    return set.has(request.user?.role?.id);
  }
}
