import { NewBoxWizard } from "./wizard";

export default async function NewBoxPage({ searchParams }: { searchParams: Promise<{ school?: string; fee?: string }> }) {
  const { school, fee } = await searchParams;
  return <NewBoxWizard initialSchoolId={school} initialFeeId={fee} />;
}
