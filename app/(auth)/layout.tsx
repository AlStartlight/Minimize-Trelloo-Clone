import "../globals.css";
import { AuthSessionProvider } from "@/components/auth/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/authOptions";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <AuthSessionProvider session={session}>{children}</AuthSessionProvider>
  );
}
