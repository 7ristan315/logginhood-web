import { can } from "@/lib/permissions";

export default function RoleGate({ role, permission, fallback = null, children }) {
  return can(role, permission) ? children : fallback;
}
