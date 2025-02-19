import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <div className="relative w-20 h-20 rounded-full overflow-hidden">
      <Image
        src={session?.user?.image || '/default-avatar.png'}
        alt="Profile"
        fill
        className="object-cover"
        sizes="80px"
      />
    </div>
  );
} 