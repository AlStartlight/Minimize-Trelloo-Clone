
import '@/app/globals.css'
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import KanbanDashboard from "@/components/kanban/KanbanBoard";
import Sidebar from '@/components/kanban/Sidebar';

export default async function DashboardPage() {
  const session = await getServerSession(getAuthOptions());

  if (!session) {
    return (
      <div className="p-4 text-center">
        <p>Redirecting to login...</p>
        <script dangerouslySetInnerHTML={{
          __html: `window.location.href = "/login"`,
        }} />
      </div>
    );
  }

  return (
    <KanbanDashboard session={session}>
      <Sidebar session={session} />
    </KanbanDashboard>
  );
}
