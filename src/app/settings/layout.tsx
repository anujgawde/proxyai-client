import { SettingsNav } from "@/components/settings/SettingsNav";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-neutral-50">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        </div>

        <div className="flex gap-6">
          <aside className="w-56 flex-shrink-0">
            <SettingsNav />
          </aside>

          <Separator orientation="vertical" className="h-auto" />

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
