import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    try {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      (request as any).user = payload;
      return handler(request);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}

export function withRole(...roles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (!roles.includes(payload.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        (request as any).user = payload;
        return handler(request);
      } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    };
  };
}
