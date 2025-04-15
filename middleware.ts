import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default authMiddleware({
  publicRoutes: [
    '/',
    '/events/:id',
    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/sign-in',
    '/sign-up',
    '/(auth)/sign-in/[[...sign-in]]',
    '/(auth)/sign-up/[[...sign-up]]'
  ],
  ignoredRoutes: [
    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/api/uploadthing'
  ],
  afterAuth: (auth, req) => {
    // Se a rota é pública, permita o acesso
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }

    // Se o usuário não está autenticado, redirecione para a página de login
    if (!auth.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Se o usuário está autenticado, permita o acesso
    return NextResponse.next();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 