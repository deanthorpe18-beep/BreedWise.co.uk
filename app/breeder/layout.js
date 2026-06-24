"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@components/AuthProvider";
import AdminBreederPortalPicker from "@components/AdminBreederPortalPicker";
import AdminBreederPreviewBar from "./AdminBreederPreviewBar";
import { useBreederAdminContext } from "./useBreederAdminContext";

function BreederLayoutInner({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const { adminPreview } = useBreederAdminContext();
  const isPortalRoute = pathname.startsWith("/breeder/portal");
  const isDashboard = pathname === "/breeder/dashboard";

  if (isAdmin && !adminPreview && isDashboard && !user?.breederSlug) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AdminBreederPortalPicker compact />
      </div>
    );
  }

  return (
    <>
      {adminPreview && !isPortalRoute && <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6"><AdminBreederPreviewBar /></div>}
      {children}
    </>
  );
}

export default function BreederLayout({ children }) {
  return (
    <Suspense fallback={children}>
      <BreederLayoutInner>{children}</BreederLayoutInner>
    </Suspense>
  );
}
