import { Metadata } from "next";

export const metadata: Metadata = {
  title: "XV Resume - Sandbox Workspace",
  description: "Isolated sandbox dashboard workspace with Obsidian theme alignment.",
};

export default function DdsDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <h1 className="text-2xl font-bold mb-2">Sandbox Workspace</h1>
      <p className="text-sm text-muted-foreground">This workspace is currently under development.</p>
    </div>
  );
}
