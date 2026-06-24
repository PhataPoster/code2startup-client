"use client";

import { useMemo, useState } from "react";
import BrowseOpportunities from "../_components/BrowseOpportunities";
import ApplyModal from "../_components/ApplyModal";
import { useCollabData } from "../_components/collab-data";

export default function CollaboratorBrowsePage() {
  const { applications, refresh } = useCollabData();
  const [selected, setSelected] = useState(null);

  // Build a Set of opportunity ids the user has already applied to so the
  // card UI can flip them to "Applied" without an extra round trip.
  const appliedIds = useMemo(() => {
    const ids = new Set();
    for (const app of applications || []) {
      const id =
        app.opportunity_id?._id ||
        app.opportunity_id ||
        app.opportunity?._id ||
        app.opportunity;
      if (id) ids.add(String(id));
    }
    return ids;
  }, [applications]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Opportunities</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Open roles at startups actively recruiting collaborators.
        </p>
      </div>

      <BrowseOpportunities
        onApply={setSelected}
        appliedIds={appliedIds}
      />

      {selected && (
        <ApplyModal
          opportunity={selected}
          onCancel={() => setSelected(null)}
          onApplied={async () => {
            setSelected(null);
            // Pull the new application into the context so the card flips
            // to "Applied" without a manual refresh.
            try {
              await refresh?.();
            } catch {}
          }}
        />
      )}
    </div>
  );
}