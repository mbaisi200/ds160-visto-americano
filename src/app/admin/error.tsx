'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin page error:', error);
  }, [error]);

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/login';
    }
  };

  const isPermissionError = error.message?.includes('permission') || 
                            error.message?.includes('insufficient') ||
                            error.message?.includes('unauthenticated');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#3C3B6E] mb-2">Erro ao Carregar</h2>
          
          {isPermissionError ? (
            <>
              <p className="text-gray-600 mb-4">
                Erro de permissão ao acessar o banco de dados.
              </p>
              <div className="text-sm text-left mb-4 bg-yellow-50 p-3 rounded-lg">
                <p className="font-semibold text-yellow-800 mb-2">Verifique as regras do Firestore:</p>
                <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                  <li>Acesse o Firebase Console</li>
                  <li>Vá em Firestore Database → Regras</li>
                  <li>Certifique-se que está assim:</li>
                </ol>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /authorized_cpfs/{cpf} {
      allow read, write: if request.auth != null;
    }
    match /ds160_forms/{formId} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-gray-600 mb-4">
              {error.message || 'Ocorreu um erro ao carregar o painel administrativo.'}
            </p>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={handleLogout} className="bg-[#B22234] hover:bg-[#8b1a28]">
              <LogOut className="h-4 w-4 mr-2" />
              Sair e Logar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
