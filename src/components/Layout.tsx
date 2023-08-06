import { useSession } from "next-auth/react";
import Navbar from "~/components/Navbar";
import { cn } from "~/lib/utils";

export default function Layout({
  children,
  className,
  hideNav = false,
}: {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
}) {
  useSession({ required: true });
  return (
    <main
      className={cn(
        "mx-auto h-screen w-screen max-w-md p-4 md:p-0 md:pt-8",
        className
      )}
    >
      {!hideNav && <Navbar />}
      {children}
    </main>
  );
}
