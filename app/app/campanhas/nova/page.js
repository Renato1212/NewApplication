import { getCurrentUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import { TEMPLATES } from '@/lib/templates';
import CampaignWizard from '@/components/CampaignWizard';

export default async function NovaCampanhaPage() {
  const user = await getCurrentUser();
  const plan = planOf(user);

  return (
    <>
      <h1>Nova campanha</h1>
      <p className="page-sub">
        Escolha um modelo, reveja a mensagem e envie. As variáveis {'{nome}'} e {'{clinica}'} são
        substituídas automaticamente.
      </p>
      <CampaignWizard
        templates={TEMPLATES}
        isPremium={user.plan === 'premium'}
        clinicName={user.clinic_name}
        smsAllowed={plan.smsExport}
      />
    </>
  );
}
