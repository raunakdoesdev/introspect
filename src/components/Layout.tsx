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
        "mx-auto w-screen max-w-md p-4 md:p-0 md:py-8 lg:max-w-lg xl:max-w-xl",
        className
      )}
    >
      {!hideNav && <Navbar />}
      {children}
    </main>
  );
}
