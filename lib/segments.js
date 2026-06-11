// Segmentação automática de pacientes pela data da última consulta.

export const SEGMENTS = {
  inativos_6m: {
    label: 'Inativos 6–12 meses',
    description: 'Sem consulta há mais de 6 meses e menos de 12. Os mais fáceis de recuperar.',
    minMonths: 6,
    maxMonths: 12,
  },
  inativos_12m: {
    label: 'Inativos 12–24 meses',
    description: 'Sem consulta há mais de 1 ano. Precisam de um incentivo mais forte.',
    minMonths: 12,
    maxMonths: 24,
  },
  inativos_24m: {
    label: 'Inativos há mais de 24 meses',
    description: 'Pacientes quase perdidos. Cada recuperação é receita pura.',
    minMonths: 24,
    maxMonths: Infinity,
  },
  todos_inativos: {
    label: 'Todos os inativos (6+ meses)',
    description: 'Todos os pacientes sem consulta há mais de 6 meses.',
    minMonths: 6,
    maxMonths: Infinity,
  },
};

export function monthsSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  if (isNaN(d)) return Infinity;
  return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

export function segmentOf(patient) {
  const m = monthsSince(patient.last_visit);
  if (m < 6) return 'ativo';
  if (m < 12) return 'inativos_6m';
  if (m < 24) return 'inativos_12m';
  return 'inativos_24m';
}

export function inSegment(patient, segmentKey) {
  const seg = SEGMENTS[segmentKey];
  if (!seg) return false;
  const m = monthsSince(patient.last_visit);
  return m >= seg.minMonths && m < seg.maxMonths;
}

export function contactablePatients(patients, segmentKey, channel) {
  return patients.filter(
    (p) =>
      p.consent &&
      !p.opted_out &&
      !p.recovered_at &&
      inSegment(p, segmentKey) &&
      (channel === 'sms' ? p.phone : p.email)
  );
}
