import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ReceiptEditorPage from "./ReceiptEditorClient";

export default function ReceiptPage(props) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
        </div>
      }
    >
      <ReceiptEditorPage {...props} />
    </Suspense>
  );
}
