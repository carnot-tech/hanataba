import { WorkspaceDetails } from "@/components/settings/workspace-details";

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <WorkspaceDetails />
      </div>
    </div>
  );
} 