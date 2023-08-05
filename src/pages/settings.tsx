import { Card, CardContent, CardHeader } from "~/components/ui/card";

import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  Loader2Icon,
} from "lucide-react";
import { useState } from "react";
import Layout from "~/components/Layout";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default function Settings() {
  const utils = api.useContext();
  const databaseId = api.journal.getDatabaseId.useQuery();
  const setDatabaseId = api.journal.setDatabaseId.useMutation({
    onSuccess: () => {
      utils.journal.getDatabaseId.invalidate().catch(console.error);
    },
  });
  const databases = api.journal.notionDatabases.useQuery();

  const [dbId, setDbId] = useState<string | null>(null);

  return (
    <Layout hideNav={true}>
      <Card>
        <CardHeader className="">
          <Link href="/" className="flex flex-row items-center">
            <ChevronLeft id="leave" className="mr-2" />
            Settings
          </Link>
        </CardHeader>

        <Separator orientation="horizontal" className="mb-4" />

        <CardContent className="flex flex-col space-y-3">
          {databases.data ? (
            <>
              {!dbId && !databaseId.data ? (
                <Alert variant={"default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Connection Required</AlertTitle>
                  <AlertDescription>
                    You must select a database below before making journal
                    entries.
                  </AlertDescription>
                </Alert>
              ) : null}
              <Label htmlFor="database">Notion Database</Label>
              <Select
                value={dbId ?? databaseId.data ?? undefined}
                onValueChange={(newId) => {
                  setDbId(newId);
                }}
              >
                <SelectTrigger id="database">
                  <SelectValue placeholder="Select Notion Database..." />
                </SelectTrigger>
                <SelectContent>
                  {databases.data?.map((database) => (
                    <SelectItem key={database.id} value={database.id}>
                      {database.title[0]?.plain_text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dbId && dbId !== databaseId.data ? (
                <Button
                  type="submit"
                  className="w-full"
                  onClick={() => {
                    setDatabaseId.mutate(dbId);
                  }}
                >
                  {setDatabaseId.isLoading ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col justify-start space-y-2">
              <Skeleton className="h-3 w-12 rounded-md" />
              <Skeleton className="h-6 w-full rounded-md" />
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
