'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

export default function PaymentMockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  const reference = searchParams.get('ref');
  const amount = searchParams.get('amount');

  const amountFormatted = amount ? (parseInt(amount) / 100).toFixed(0) : '0';

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      // Simuler un délai de paiement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Appeler le webhook de confirmation
      await axios.post('/api/dexpay/webhook', {
        reference,
        status: 'success',
        amount: parseInt(amount || '0'),
      });

      // Rediriger vers la page de succès
      router.push('/payment/success?ref=' + reference);
    } catch (error) {
      console.error('Erreur simulation paiement:', error);
      alert('Erreur lors de la simulation du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = () => {
    router.push('/payment/failure?ref=' + reference);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            🧪 Simulation Paiement DexPay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Mode Test</strong> - Aucun paiement réel ne sera effectué
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Référence</span>
              <span className="font-mono text-sm text-slate-900">{reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Montant</span>
              <span className="text-2xl font-bold text-slate-900">
                {amountFormatted} FCFA
              </span>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <p className="text-sm text-slate-600 text-center mb-4">
              Choisissez le résultat de la simulation :
            </p>
            <Button
              onClick={handlePaymentSuccess}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isProcessing ? 'Traitement...' : '✅ Simuler Paiement Réussi'}
            </Button>
            <Button
              onClick={handlePaymentFailure}
              disabled={isProcessing}
              variant="danger"
              className="w-full"
              size="lg"
            >
              ❌ Simuler Paiement Échoué
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Cette page simule l'interface de paiement DexPay. <br />
            En production, l'utilisateur serait redirigé vers DexPay.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
