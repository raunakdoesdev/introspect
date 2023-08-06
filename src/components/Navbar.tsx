import { Crown, LogOut, Menu, Settings } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { signOut, useSession } from "next-auth/react";

export default function Navigation() {
  return (
    <div className="mb-4 flex w-full flex-row items-center justify-between">
      <Link href="/" className="font-semibold">
        Introspect
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Menu size={24} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-sm">
            <Crown className="mr-2 h-4 w-4" />
            <span>Upgrade</span>
          </DropdownMenuItem>
          <Link href="/settings">
            <DropdownMenuItem className="text-sm">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem
            className="text-sm"
            onClick={() => {
              signOut().catch(console.error);
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
