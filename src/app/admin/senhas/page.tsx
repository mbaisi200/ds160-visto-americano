'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Key,
  AlertCircle,
  LogOut,
  Loader2,
  Shield,
  Users,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface UserInfo {
  uid: string;
  email: string;
  disabled: boolean;
  createdAt: string;
  lastSignIn: string;
}

interface AdminStatus {
  success: boolean;
  adminConfigured: boolean;
  adminExists: boolean;
  adminEmail: string;
  count: number;
  users: UserInfo[];
  error?: string;
  instructions?: string;
  setupUrl?: string;
}

export default function AdminSenhasPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (loading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      // Check if admin
      const isAdmin = user.email === 'admin@vistoamericano.com';
      if (!isAdmin) {
        router.push('/formulario');
        return;
      }

      // Fetch admin status
      await fetchAdminStatus();
    };

    checkAdmin();
  }, [user, loading, router]);

  const fetchAdminStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setAdminStatus(data);
    } catch (error) {
      console.error('Error fetching admin status:', error);
      setAdminStatus({
        success: false,
        adminConfigured: false,
        adminExists: false,
        adminEmail: '',
        count: 0,
        users: [],
        error: 'Erro ao verificar status do Firebase Admin',
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleResetAdminPassword = async () => {
    if (!newAdminPassword || newAdminPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-or-reset-admin',
          password: newAdminPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setNewAdminPassword('');
      } else {
        toast.error(data.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Error resetting admin password:', error);
      toast.error('Erro ao redefinir senha');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetUserPassword = async () => {
    if (!resetEmail) {
      toast.error('Digite o email do usuário');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-user-password',
          email: resetEmail,
          password: resetPassword || '123456',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setResetEmail('');
        setResetPassword('');
      } else {
        toast.error(data.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Error resetting user password:', error);
      toast.error('Erro ao redefinir senha');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  if (loading || loadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#B22234] mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#3C3B6E] to-[#B22234] rounded-full flex items-center justify-center">
                <Key className="text-white h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h1 className="font-bold text-[#3C3B6E] text-sm sm:text-base">Gerenciar Senhas</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Administração de acesso</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/admin')} className="h-9">
                Voltar
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-9">
                <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Status Card */}
        {!adminStatus?.adminConfigured && (
          <Alert className="mb-6 border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Firebase Admin não configurado!</strong><br />
              Para gerenciar senhas, configure o FIREBASE_SERVICE_ACCOUNT no arquivo .env.
              <Button
                variant="link"
                className="p-0 ml-2 text-yellow-800 underline"
                onClick={() => window.open('/api/admin/setup', '_blank')}
              >
                Ver instruções <ExternalLink className="h-3 w-3 inline ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {adminStatus?.adminConfigured && (
          <Alert className="mb-6 border-green-300 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Firebase Admin configurado!</strong> - {adminStatus.count} usuários encontrados.
              {adminStatus.adminExists && ' Conta admin existe.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Admin Password Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#3C3B6E]" />
              <CardTitle className="text-lg">Senha do Administrador</CardTitle>
            </div>
            <CardDescription>
              Redefina a senha da conta admin@vistoamericano.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-blue-300 bg-blue-50">
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Login:</strong> CPF <code className="bg-blue-100 px-1 rounded">admin</code> ou <code className="bg-blue-100 px-1 rounded">000.000.000-00</code><br />
                  <strong>Email:</strong> <code className="bg-blue-100 px-1 rounded">admin@vistoamericano.com</code>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="adminPassword">Nova Senha</Label>
                  <Input
                    id="adminPassword"
                    type="text"
                    placeholder="Mínimo 6 caracteres"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleResetAdminPassword}
                    disabled={actionLoading || !adminStatus?.adminConfigured}
                    className="bg-[#B22234] hover:bg-[#8b1a28] w-full sm:w-auto"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Redefinir Senha
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewAdminPassword('123456');
                  toast.info('Senha padrão preenchida');
                }}
              >
                Usar senha padrão (123456)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Password Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#3C3B6E]" />
              <CardTitle className="text-lg">Redefinir Senha de Usuário</CardTitle>
            </div>
            <CardDescription>
              Redefina a senha de qualquer usuário pelo email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="userEmail">Email do Usuário</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="12345678901@ds160.local"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword">Nova Senha (opcional)</Label>
                  <Input
                    id="userPassword"
                    type="text"
                    placeholder="Padrão: 123456"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                onClick={handleResetUserPassword}
                disabled={actionLoading || !adminStatus?.adminConfigured}
                className="bg-[#3C3B6E] hover:bg-[#2a2a52]"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Redefinir Senha do Usuário
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {adminStatus?.adminConfigured && adminStatus.users && adminStatus.users.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#3C3B6E]" />
                  <CardTitle className="text-lg">Usuários Cadastrados</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAdminStatus}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-sm">Email</th>
                      <th className="text-left py-2 px-2 text-sm hidden sm:table-cell">Último Acesso</th>
                      <th className="text-right py-2 px-2 text-sm">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminStatus.users.map((u) => (
                      <tr key={u.uid} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono truncate max-w-[200px]">{u.email}</span>
                            {u.email === 'admin@vistoamericano.com' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">ADMIN</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-500 hidden sm:table-cell">
                          {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setResetEmail(u.email || '');
                              toast.info('Email preenchido. Defina a nova senha abaixo.');
                            }}
                          >
                            <Key className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard(u.email || '')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
