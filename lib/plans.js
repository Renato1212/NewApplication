// Limites dos planos. O plano Premium é o produto que se vende: €49/mês.

export const PLANS = {
  gratis: {
    label: 'Essencial',
    price: 0,
    maxPatients: 50,
    maxCampaignsPerMonth: 1,
    smsExport: false,
    premiumTemplates: false,
  },
  premium: {
    label: 'Premium',
    price: 49,
    maxPatients: Infinity,
    maxCampaignsPerMonth: Infinity,
    smsExport: true,
    premiumTemplates: true,
  },
};

export function planOf(user) {
  return PLANS[user?.plan] || PLANS.gratis;
}
