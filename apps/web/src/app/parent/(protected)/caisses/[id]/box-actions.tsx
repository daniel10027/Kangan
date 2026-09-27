"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SavingsBoxStatus } from "@kangan/shared";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";
import { PaymentDialog } from "@/components/PaymentDialog";

export function BoxActions({
  boxId,
  suggestedAmount,
  defaultPhone,
  status,
}: {
  boxId: string;
  suggestedAmount: number;
  defaultPhone: string;
  status: SavingsBoxStatus;
}) {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createContributionLink() {
    setLoading(true);
    try {
      const link = await api.post<{ share_url: string }>(`/boxes/${boxId}/contribution-links`, {
        max_amount: 50_000,
        expires_in_hours: 24 * 14,
      });
      setShareUrl(link.share_url);
      if (navigator.share) {
        await navigator.share({ title: "Contribuer à une caisse Kangan", url: link.share_url });
      }
    } catch (err) {
      if (err instanceof ApiError) alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canPay = status === "en_attente" || status === "active";

  return (
    <div className="space-y-3">
      {canPay && (
        <PaymentDialog
          boxId={boxId}
          suggestedAmount={suggestedAmount}
          defaultPhone={defaultPhone}
          onSettled={() => router.refresh()}
          trigger={<Button className="w-full">Verser maintenant</Button>}
        />
      )}

      <a
        href={`/api/v1/boxes/${boxId}/statement`}
        target="_blank"
        rel="noreferrer"
        className="focus-ring flex min-h-[48px] w-full items-center justify-center rounded-field border border-encre/15 text-sm font-semibold text-encre hover:bg-encre/5"
      >
        Télécharger le relevé (PDF)
      </a>

      <Button variant="ghost" className="w-full" loading={loading} onClick={createContributionLink}>
        Inviter un proche à contribuer
      </Button>

      {shareUrl && (
        <p className="break-all rounded-field bg-encre/5 p-3 text-xs text-encre/60">{shareUrl}</p>
      )}
    </div>
  );
}
