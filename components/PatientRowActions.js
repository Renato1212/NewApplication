'use client';

import { useRouter } from 'next/navigation';

export default function PatientRowActions({ patient }) {
  const router = useRouter();

  async function patch(body) {
    await fetch(`/api/pacientes/${patient.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  async function markRecovered() {
    const value = prompt('Valor estimado do tratamento (€):', '450');
    if (value === null) return;
    await patch({ recovered: true, recovered_value: Number(value) || 0 });
  }

  async function remove() {
    if (!confirm('Eliminar este paciente e todos os seus dados?')) return;
    await fetch(`/api/pacientes/${patient.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
      {!patient.recovered && (
        <button className="btn btn-sm btn-outline" title="Marcar como recuperado" onClick={markRecovered}>
          ✓ Recuperado
        </button>
      )}
      {!patient.opted_out && (
        <button
          className="btn btn-sm btn-outline"
          title="Pediu para não receber comunicações (RGPD)"
          onClick={() => patch({ opted_out: true })}
        >
          🚫
        </button>
      )}
      <button className="btn btn-sm btn-danger" title="Eliminar paciente" onClick={remove}>
        ✕
      </button>
    </div>
  );
}
