'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Shield, Mail } from 'lucide-react';

export default function AdminSetupPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { createAdminIfNotExists, resetPassword } = useAuth();
  const router = useRouter();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await createAdminIfNotExists('admin@vistoamericano.com', password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Se o erro for de credenciais inválidas, mostrar opção de reset
        if (err.message.includes('invalid-credential') || err.message.includes('wrong-password')) {
          setError('A conta admin já existe com outra senha. Use a opção de redefinir senha.');
          setResetMode(true);
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao criar conta de administrador.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    
    try {
      await resetPassword('admin@vistoamericano.com');
      setResetSent(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao enviar email de redefinição.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#623AA2] via-[#8b5cb6] to-[#F97794] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#623AA2] mb-2">Admin Criado!</h2>
            <p className="text-gray-600 mb-4">
              Conta de administrador criada com sucesso. Redirecionando...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#623AA2]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#623AA2] via-[#8b5cb6] to-[#F97794] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#623AA2] mb-2">Email Enviado!</h2>
            <p className="text-gray-600 mb-4">
              Verifique sua caixa de entrada em <strong>admin@vistoamericano.com</strong> para redefinir a senha.
            </p>
            <Button onClick={() => router.push('/login')} className="bg-[#009639] hover:bg-[#007a2e]">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#623AA2] via-[#8b5cb6] to-[#F97794] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#623AA2] to-[#F97794] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#623AA2]">Configuração Admin</CardTitle>
          <CardDescription>
            {resetMode ? 'Redefina a senha do administrador' : 'Crie a senha do administrador do sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-blue-300 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Email:</strong> admin@vistoamericano.com
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resetMode ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                A conta admin já existe. Clique abaixo para receber um email de redefinição de senha.
              </p>
              <Button
                onClick={handleResetPassword}
                className="w-full bg-[#009639] hover:bg-[#007a2e]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email de Redefinição
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setResetMode(false)}
                className="w-full"
              >
                Voltar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#009639] hover:bg-[#007a2e]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Criar Conta Admin
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setResetMode(true)}
                className="w-full"
              >
                Já existe? Redefinir Senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
