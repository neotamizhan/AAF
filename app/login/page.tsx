import { LoginPanel } from "@/components/login-panel";
import { Shell } from "@/components/ui";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return (
    <Shell className="max-w-xl">
      <LoginPanel initialMessage={searchParams?.error ?? ""} />
    </Shell>
  );
}
