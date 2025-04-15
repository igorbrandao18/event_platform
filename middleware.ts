import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createUser } from "./lib/actions/user.actions";
import getUserModel from "./lib/database/models/user.model";
import { connectToDatabase } from "./lib/database";

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
  afterAuth: async (auth, req) => {
    // Se a rota é pública, permita o acesso
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }

    // Se o usuário não está autenticado, redirecione para a página de login
    if (!auth.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    try {
      // Se o usuário está autenticado, verifique se já existe no banco de dados
      if (auth.userId && auth.user) {
        await connectToDatabase();
        const User = await getUserModel();
        
        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ clerkId: auth.userId });
        
        // Se o usuário não existe, crie-o
        if (!existingUser) {
          const user = {
            clerkId: auth.userId,
            email: auth.user.emailAddresses[0]?.emailAddress || '',
            username: auth.user.username || auth.user.firstName?.toLowerCase() || '',
            firstName: auth.user.firstName || '',
            lastName: auth.user.lastName || '',
            photo: auth.user.imageUrl || '',
          };

          await createUser(user);
        }
      }
    } catch (error) {
      console.error('Error in middleware:', error);
      // Continue mesmo se houver erro, pois o webhook pode ter criado o usuário
    }

    // Permita o acesso
    return NextResponse.next();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 