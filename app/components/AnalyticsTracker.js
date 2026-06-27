import { Suspense } from "react";
import VisitorJourneyTracker from "@components/VisitorJourneyTracker";

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <VisitorJourneyTracker />
    </Suspense>
  );
}
