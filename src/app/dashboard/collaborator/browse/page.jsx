"use client";

import BrowseOpportunities from "../_components/BrowseOpportunities";

export default function CollaboratorBrowsePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Opportunities</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Open roles at startups actively recruiting collaborators.
        </p>
      </div>
      <BrowseOpportunities />
    </div>
  );
}