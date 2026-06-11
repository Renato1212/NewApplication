'use client';

import { useRouter } from 'next/navigation';

export default function RecoverButton({ campaignId, patientId }) {
  const router = useRouter();

  async function recover() {
    const value = prompt('O paciente remarcou! Valor estimado do tratamento (€):', '450');
    if (value === null) return;
    await fetch(`/api/campanhas/${campaignId}/recuperar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patientId, value: Number(value) || 0 }),
    });
    router.refresh();
  }

  return (
    <button className="btn btn-sm btn-outline" onClick={recover}>
      ✓ Remarcou consulta
    </button>
  );
}
