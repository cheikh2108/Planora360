'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token || typeof token !== 'string') {
      setStatus('error');
      setMessage('Token de vérification invalide');
      return;
    }

    // Vérifier l'email
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-email/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Erreur lors de la vérification');
        }
        setStatus('success');
        setMessage(data.message);
        setEmail(data.email);

        // Redirection automatique vers /login après 5 secondes
        setTimeout(() => {
          router.push('/auth/login');
        }, 5000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Une erreur est survenue');
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={32} className="text-[#2563eb] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Vérification en cours</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Veuillez patienter pendant que nous vérifions votre adresse email...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Compte activé !</h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              {message || 'Votre compte a été activé avec succès.'}
            </p>
            {email && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-blue-900 mb-1">📧 Consultez votre boîte mail</p>
                <p className="text-xs text-blue-700">
                  Un email contenant vos identifiants de connexion a été envoyé à <span className="font-mono font-bold">{email}</span>
                </p>
              </div>
            )}
            <p className="text-xs text-slate-400 mb-6">
              Redirection automatique vers la page de connexion dans 5 secondes...
            </p>
            <Link
              href="/auth/login"
              className="block w-full h-11 leading-[2.75rem] text-center bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Se connecter maintenant
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Erreur de vérification</h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {message || 'Le lien de vérification est invalide ou a expiré.'}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full h-11 leading-[2.75rem] text-center bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Retour à la connexion
              </Link>
              <a
                href="mailto:support@planora360.org"
                className="block w-full h-11 leading-[2.75rem] text-center border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Contacter le support
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
