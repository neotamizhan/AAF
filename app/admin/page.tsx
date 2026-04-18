import { CsvImportPanel } from "@/components/csv-import-panel";
import { SectionHeader, Shell } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";

  return (
    <Shell>
      <SectionHeader
        eyebrow="Admin"
        title="Election operations"
        description="Validate CSV files, manage official imports through Edge Functions, and keep production writes server-side."
      />

      {!isAdmin ? (
        <section className="mb-5 rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold">Restricted operations</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Admin imports require an email-authenticated profile with role admin.
            The preview below validates CSV shape but does not write data.
          </p>
        </section>
      ) : null}

      <CsvImportPanel />
    </Shell>
  );
}
