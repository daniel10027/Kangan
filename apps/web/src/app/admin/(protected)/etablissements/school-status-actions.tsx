"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/Button";

export function SchoolStatusActions({ schoolId, currentStatus }: { schoolId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: string) {
    setLoading(true);
    try {
      await api.put(`/admin/schools/${schoolId}`, { status });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== "actif" && (
        <Button size="sm" loading={loading} onClick={() => setStatus("actif")}>
          Activer
        </Button>
      )}
      {currentStatus === "actif" && (
        <Button size="sm" variant="danger" loading={loading} onClick={() => setStatus("suspendu")}>
          Suspendre
        </Button>
      )}
    </div>
  );
}
