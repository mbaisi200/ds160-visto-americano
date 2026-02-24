'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, LogIn, Info } from 'lucide-react';
import { maskCPF } from '@/lib/masks';

export default function LoginPage() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithCPF, user, userData } = useAuth();
  const router = useRouter();

  const handleCPFChange = (value: string) => {
    // Permite digitar "admin" sem máscara
    // Se o valor atual começa com letra 'a', permite digitar sem máscara
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'admin' || lowerValue.startsWith('a') || /^[a-zA-Z]/.test(value)) {
      setCpf(lowerValue);
    } else {
      setCpf(maskCPF(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithCPF(cpf, password);
      // Wait a bit for userData to load
      setTimeout(() => {
        // Check if admin - redirect to admin panel
        const isAdmin = cpf.toLowerCase() === 'admin' || cpf.replace(/\D/g, '') === '00000000000';
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/formulario');
        }
      }, 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3C3B6E] via-[#1a1a3e] to-[#B22234] p-4">
      <Card className="w-full max-w-md mx-2 sm:mx-0">
        <CardHeader className="text-center px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#3C3B6E] to-[#B22234] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white font-bold text-lg sm:text-xl">SB</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-[#3C3B6E]">Acessar Sistema</CardTitle>
          <CardDescription className="text-sm">
            Digite seu CPF e senha para acessar o formulário DS160
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Alert className="mb-4 border-blue-300 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <AlertDescription className="text-blue-800 text-xs sm:text-sm">
              <strong>Primeiro acesso?</strong> Sua senha padrão é <strong>123456</strong>. 
              Entre em contato conosco se seu CPF ainda não foi autorizado.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                maxLength={14}
                required
              />
              <p className="text-xs text-gray-500">Digite seu CPF ou "admin" para acesso administrativo</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#B22234] hover:bg-[#8b1a28] h-11 sm:h-10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              CPF não autorizado?{' '}
              <a href="https://wa.me/5511999999999" className="text-[#B22234] hover:underline font-medium">
                Entre em contato
              </a>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Voltar para página inicial
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
