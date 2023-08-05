import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Layout from "~/components/Layout";
import { Card, CardHeader } from "~/components/ui/card";
import { api } from "~/utils/api";

export default function Checkin() {
  const databaseId = api.journal.getDatabaseId.useQuery();

  return (
    <Layout hideNav>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Link href="/" className="flex flex-row items-center">
            <ChevronLeft id="leave" className="mr-2" />
            Daily check-in
          </Link>
          <div className="text-primary">Finish</div>
        </CardHeader>
      </Card>
    </Layout>
  );
}
