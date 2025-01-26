import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username?: string;
    name?: string;
    image?: string;
    bio?: string;
    stripeCustomerId?: string;
    stripeConnectAccountId?: string;
  }

  interface Session {
    user: User & {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    }
  }
} 