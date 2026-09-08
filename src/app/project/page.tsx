import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/auth-server";

export default async function ProjectDestinationShell() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="bg-background text-text-primary flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Taskly Workspace</h1>
        <p className="text-text-muted mt-2">Authentication successful.</p>
      </div>
    </main>
  );
}
