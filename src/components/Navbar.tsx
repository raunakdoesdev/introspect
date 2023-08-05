import { Crown, Menu, Settings } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function Navigation() {
  return (
    <div className="mb-4 flex w-full flex-row items-center justify-between">
      <Link href="/">Introspect</Link>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
