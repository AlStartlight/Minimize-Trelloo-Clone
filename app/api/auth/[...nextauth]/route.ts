import NextAuth from "next-auth"
import { getAuthOptions } from "./authOptions"

const handler = NextAuth(getAuthOptions())
export { handler as GET, handler as POST }