'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  Users,
  FileText,
  AlertCircle,
  LogOut,
  Loader2,
  Download,
  Eye,
  Trash2,
  UserPlus,
  Search,
  Edit,
  Lock,
  Unlock,
  Key,
  FileDown
} from 'lucide-react';
import { formatDateToBrazilian, formatDate, maskCPF } from '@/lib/masks';
import { toast } from 'sonner';

interface Formulario {
  id: string;
  userId: string;
  cpf: string;
  nome?: string;
  dados: Record<string, unknown>;
  status: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
}

interface AuthorizedCPF {
  id: string;
  cpf: string;
  email?: string;
  hasAccount?: boolean;
  blocked?: boolean;
  createdAt?: { seconds: number; nanoseconds: number };
  userId?: string;
  nome?: string;
}

const DEFAULT_PASSWORD = '123456';

export default function AdminPage() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [authorizedCPFs, setAuthorizedCPFs] = useState<AuthorizedCPF[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<'formularios' | 'cpfs'>('formularios');
  const [selectedForm, setSelectedForm] = useState<Formulario | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [editingCPF, setEditingCPF] = useState<AuthorizedCPF | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newCPFValue, setNewCPFValue] = useState('');
  const [newCPF, setNewCPF] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [periodFilter, setPeriodFilter] = useState('todos');

  useEffect(() => {
    const initAdmin = async () => {
      try {
        // If still loading auth, wait
        if (loading) return;
        
        // If not logged in, redirect to login
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Check if admin by email or role
        const isAdmin = user.email === 'admin@vistoamericano.com' || userData?.role === 'admin';
        
        if (!isAdmin) {
          router.push('/formulario');
          return;
        }
        
        // User is admin, load data
        await loadData();
        setInitialLoad(false);
      } catch (error) {
        console.error('Admin init error:', error);
        setErrorData('Erro ao carregar dados. Verifique as permissões do Firebase.');
        setInitialLoad(false);
      }
    };
    
    initAdmin();
  }, [user, loading, router, userData]);

  const loadData = async () => {
    try {
      setErrorData(null);
      setLoadingData(true);
      // Load forms - use simple query without orderBy to avoid index issues
      const formsSnapshot = await getDocs(collection(db, 'ds160_forms'));
      const formsData = formsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Formulario[];
      // Sort in memory
      formsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setFormularios(formsData);

      // Load authorized CPFs
      const cpfsSnapshot = await getDocs(collection(db, 'authorized_cpfs'));
      const cpfsData = cpfsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuthorizedCPF[];
      setAuthorizedCPFs(cpfsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setErrorData('Erro ao carregar dados. Verifique as permissões do Firebase.');
      throw error;
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const authorizeCPF = async () => {
    if (!newCPF || newCPF.replace(/\D/g, '').length !== 11) {
      toast.error('CPF inválido');
      return;
    }

    const cleanCPF = newCPF.replace(/\D/g, '');

    // Check if already exists
    const existingDoc = await getDoc(doc(db, 'authorized_cpfs', cleanCPF));
    if (existingDoc.exists()) {
      toast.error('Este CPF já está autorizado');
      return;
    }

    try {
      // Create email based on CPF
      const email = `${cleanCPF}@ds160.local`;

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        cpf: cleanCPF,
        role: 'user',
        createdAt: new Date()
      });

      // Create authorized_cpfs entry
      await setDoc(doc(db, 'authorized_cpfs', cleanCPF), {
        cpf: cleanCPF,
        email: email,
        createdAt: new Date(),
        hasAccount: true,
        blocked: false,
        userId: userCredential.user.uid
      });

      toast.success(`CPF autorizado! Senha padrão: ${DEFAULT_PASSWORD}`);
      setNewCPF('');
      loadData();
    } catch (error: unknown) {
      console.error('Error authorizing CPF:', error);
      if (error instanceof Error && error.message.includes('email-already-in-use')) {
        toast.error('Este CPF já possui uma conta associada');
      } else {
        toast.error('Erro ao autorizar CPF');
      }
    }
  };

  const removeCPF = async (cpf: string) => {
    if (!confirm('Tem certeza que deseja remover este CPF?')) return;

    try {
      await deleteDoc(doc(db, 'authorized_cpfs', cpf));
      toast.success('CPF removido com sucesso');
      loadData();
    } catch (error) {
      console.error('Error removing CPF:', error);
      toast.error('Erro ao remover CPF');
    }
  };

  const toggleBlockCPF = async (cpf: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'authorized_cpfs', cpf), {
        blocked: !currentStatus
      });
      toast.success(currentStatus ? 'CPF desbloqueado' : 'CPF bloqueado');
      loadData();
    } catch (error) {
      console.error('Error toggling block:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const createAccountForCPF = async (cpfData: AuthorizedCPF) => {
    try {
      // Create email based on CPF
      const email = `${cpfData.cpf}@ds160.local`;

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        cpf: cpfData.cpf,
        role: 'user',
        createdAt: new Date()
      });

      // Update authorized_cpfs entry
      await updateDoc(doc(db, 'authorized_cpfs', cpfData.cpf), {
        email: email,
        hasAccount: true,
        blocked: false,
        userId: userCredential.user.uid
      });

      toast.success(`Conta criada! Senha padrão: ${DEFAULT_PASSWORD}`);
      loadData();
    } catch (error: unknown) {
      console.error('Error creating account:', error);
      if (error instanceof Error && error.message.includes('email-already-in-use')) {
        toast.error('Este CPF já possui uma conta associada');
      } else {
        toast.error('Erro ao criar conta');
      }
    }
  };

  const openEditDialog = (cpfData: AuthorizedCPF) => {
    setEditingCPF(cpfData);
    setNewCPFValue(cpfData.cpf);
    setShowEditDialog(true);
  };

  const openPasswordDialog = (cpfData: AuthorizedCPF) => {
    setEditingCPF(cpfData);
    setNewPassword('');
    setShowPasswordDialog(true);
  };

  const resetPassword = async () => {
    if (!editingCPF?.email) {
      toast.error('CPF sem email associado');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      // Update in Firestore - store a flag indicating password was changed
      await updateDoc(doc(db, 'authorized_cpfs', editingCPF.cpf), {
        passwordChanged: true,
        passwordChangedAt: new Date()
      });
      
      // Note: To actually change Firebase Auth password, you'd need to use Admin SDK on backend
      // For now, we'll show success but the actual password change requires backend implementation
      toast.success('Para alterar a senha, use o painel do Firebase Console');
      setShowPasswordDialog(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Erro ao alterar senha');
    }
  };

  const updateCPF = async () => {
    if (!editingCPF) return;
    
    const cleanNewCPF = newCPFValue.replace(/\D/g, '');
    
    if (cleanNewCPF.length !== 11) {
      toast.error('CPF inválido');
      return;
    }

    if (cleanNewCPF === editingCPF.cpf) {
      setShowEditDialog(false);
      return;
    }

    // Check if new CPF already exists
    const existingDoc = await getDoc(doc(db, 'authorized_cpfs', cleanNewCPF));
    if (existingDoc.exists()) {
      toast.error('Este CPF já está cadastrado');
      return;
    }

    try {
      // Create new document with new CPF
      const newData = {
        ...editingCPF,
        cpf: cleanNewCPF,
        email: `${cleanNewCPF}@ds160.local`
      };
      delete (newData as Record<string, unknown>).id;
      
      await setDoc(doc(db, 'authorized_cpfs', cleanNewCPF), newData);
      
      // Delete old document
      await deleteDoc(doc(db, 'authorized_cpfs', editingCPF.cpf));
      
      // Update user document if exists
      if (editingCPF.userId) {
        await updateDoc(doc(db, 'users', editingCPF.userId), {
          cpf: cleanNewCPF,
          email: `${cleanNewCPF}@ds160.local`
        });
      }
      
      // Update forms if exist
      const formsSnapshot = await getDocs(collection(db, 'ds160_forms'));
      for (const formDoc of formsSnapshot.docs) {
        const formData = formDoc.data();
        if (formData.cpf === editingCPF.cpf) {
          await updateDoc(doc(db, 'ds160_forms', formDoc.id), {
            cpf: cleanNewCPF
          });
        }
      }

      toast.success('CPF atualizado com sucesso');
      setShowEditDialog(false);
      loadData();
    } catch (error) {
      console.error('Error updating CPF:', error);
      toast.error('Erro ao atualizar CPF');
    }
  };

  const updateFormStatus = async (formId: string, status: string, cpf: string) => {
    try {
      // Atualizar status do formulário
      await updateDoc(doc(db, 'ds160_forms', formId), {
        status,
        updatedAt: new Date()
      });

      // Se status for "processado", bloquear o CPF do cliente
      if (status === 'processado' && cpf) {
        const cpfDoc = await getDoc(doc(db, 'authorized_cpfs', cpf));
        if (cpfDoc.exists()) {
          await updateDoc(doc(db, 'authorized_cpfs', cpf), {
            blocked: true,
            blockedAt: new Date(),
            blockedReason: 'Formulário processado'
          });
          toast.success('Status atualizado e cliente bloqueado');
        } else {
          toast.success('Status atualizado');
        }
      } else {
        toast.success('Status atualizado');
      }

      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const generateTXT = (form: Formulario) => {
    const dados = form.dados as Record<string, unknown>;
    let txt = 'FORMULÁRIO DS160 - VISTO AMERICANO\n';
    txt += '=====================================\n\n';
    txt += `CPF: ${form.cpf}\n`;
    txt += `Status: ${form.status}\n`;
    txt += `Data de Criação: ${formatDate(form.createdAt)}\n\n`;
    txt += '--- DADOS DO FORMULÁRIO ---\n\n';

    Object.entries(dados).forEach(([key, value]) => {
      if (value && (typeof value === 'string' || typeof value === 'number')) {
        txt += `${key}: ${value}\n`;
      }
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DS160_${form.cpf}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDF = (form: Formulario) => {
    const dados = form.dados as Record<string, unknown>;
    
    // Create printable HTML content
    const sections: { title: string; fields: { label: string; value: string }[] }[] = [
      { title: 'Informações Pessoais', fields: [] },
      { title: 'Contato', fields: [] },
      { title: 'Passaporte', fields: [] },
      { title: 'Viagem', fields: [] },
      { title: 'Outras Informações', fields: [] }
    ];

    // Map fields to sections
    const fieldMap: Record<string, { section: number; label: string }> = {
      lastName: { section: 0, label: 'Sobrenome' },
      firstName: { section: 0, label: 'Nome' },
      birthDate: { section: 0, label: 'Data de Nascimento' },
      birthCity: { section: 0, label: 'Cidade de Nascimento' },
      birthCountry: { section: 0, label: 'País de Nascimento' },
      cpf: { section: 0, label: 'CPF' },
      rg: { section: 0, label: 'RG' },
      address: { section: 1, label: 'Endereço' },
      city: { section: 1, label: 'Cidade' },
      contactState: { section: 1, label: 'Estado' },
      zipCode: { section: 1, label: 'CEP' },
      phone1: { section: 1, label: 'Telefone Principal' },
      phone2: { section: 1, label: 'Telefone Opcional' },
      email: { section: 1, label: 'E-mail' },
      passportSeries: { section: 2, label: 'Série do Passaporte' },
      passportNumber: { section: 2, label: 'Número do Passaporte' },
      passportIssueDate: { section: 2, label: 'Data de Emissão' },
      passportExpiryDate: { section: 2, label: 'Data de Expiração' },
      travelReason: { section: 3, label: 'Motivo da Viagem' },
      arrivalDate: { section: 3, label: 'Data de Chegada' },
      stayDuration: { section: 3, label: 'Tempo de Permanência' },
      placesToVisit: { section: 3, label: 'Locais a Visitar' },
      jobTitle: { section: 4, label: 'Ocupação' },
      companyName: { section: 4, label: 'Empresa' },
      fatherName: { section: 4, label: 'Nome do Pai' },
      motherName: { section: 4, label: 'Nome da Mãe' },
    };

    // Populate sections
    Object.entries(dados).forEach(([key, value]) => {
      if (value && (typeof value === 'string' || typeof value === 'number')) {
        const mapping = fieldMap[key];
        if (mapping) {
          let displayValue = String(value);
          if (key.includes('Date') && typeof value === 'string') {
            displayValue = formatDateToBrazilian(value);
          }
          sections[mapping.section].fields.push({
            label: mapping.label,
            value: displayValue
          });
        } else {
          // Add to "Outras Informações" section
          let displayValue = String(value);
          if (key.includes('Date') && typeof value === 'string') {
            displayValue = formatDateToBrazilian(value);
          }
          sections[4].fields.push({
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: displayValue
          });
        }
      }
    });

    // Generate HTML
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DS160 - ${form.cpf}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #3C3B6E; border-bottom: 3px solid #B22234; padding-bottom: 10px; }
          h2 { color: #3C3B6E; border-bottom: 1px solid #ddd; margin-top: 30px; }
          .info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .field { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; width: 200px; color: #666; }
          .value { flex: 1; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #3C3B6E; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SB Viagens e Turismo</div>
          <div style="text-align: right; color: #666;">
            Gerado em: ${new Date().toLocaleDateString('pt-BR')}<br>
            Status: ${form.status?.toUpperCase()}
          </div>
        </div>
        
        <h1>Formulário DS160 - Visto Americano</h1>
        
        <div class="info">
          <strong>CPF:</strong> ${form.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}<br>
          <strong>Data de Criação:</strong> ${formatDate(form.createdAt)}
        </div>
    `;

    sections.forEach(section => {
      if (section.fields.length > 0) {
        html += `<h2>${section.title}</h2>`;
        section.fields.forEach(field => {
          html += `
            <div class="field">
              <div class="label">${field.label}:</div>
              <div class="value">${field.value}</div>
            </div>
          `;
        });
      }
    });

    html += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #888; font-size: 12px;">
          Este documento foi gerado automaticamente pelo sistema DS160 - SB Viagens e Turismo<br>
          Não é um documento oficial do governo dos Estados Unidos
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    
    toast.success('Documento aberto! Use Ctrl+P (ou Cmd+P no Mac) para salvar como PDF.');
  };

  // Função para verificar se está no período selecionado
  const isInPeriod = (form: Formulario): boolean => {
    if (periodFilter === 'todos') return true;
    
    const formDate = new Date(form.createdAt?.seconds * 1000);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (periodFilter) {
      case 'hoje':
        return formDate >= today;
      case 'semana': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return formDate >= weekAgo;
      }
      case 'mes': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return formDate >= monthAgo;
      }
      case 'trimestre': {
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return formDate >= quarterAgo;
      }
      default:
        return true;
    }
  };

  const filteredFormularios = formularios.filter(f => {
    const matchesSearch = f.cpf.includes(searchTerm) || 
      (f.dados?.firstName as string)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.dados?.lastName as string)?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || f.status === statusFilter;
    const matchesPeriod = isInPeriod(f);
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Remove duplicates - show only latest form per CPF
  const uniqueFormularios = filteredFormularios.filter((form, index, self) => {
    const latestIndex = self.findIndex(f => f.cpf === form.cpf);
    // Keep only if this is the latest (highest index = most recent due to sorting)
    return index === latestIndex;
  });

  const filteredCPFs = authorizedCPFs.filter(c => 
    c.cpf.includes(searchTerm) || c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCPFDisplay = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (loading || initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#B22234] mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (errorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#3C3B6E] mb-2">Erro de Permissão</h2>
            <p className="text-gray-600 mb-4">{errorData}</p>
            <Alert className="mb-4 text-left">
              <AlertDescription className="text-sm">
                <strong>Como resolver:</strong><br/>
                1. Acesse o <a href="https://console.firebase.google.com/project/vistoamericano-58f87" target="_blank" className="text-[#B22234] underline">Firebase Console</a><br/>
                2. Vá em Firestore Database → Regras<br/>
                3. Cole as regras corretas e publique
              </AlertDescription>
            </Alert>
            <Button onClick={loadData} className="bg-[#B22234] hover:bg-[#8b1a28]">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
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
                <span className="text-white font-bold text-sm sm:text-base">SB</span>
              </div>
              <div>
                <h1 className="font-bold text-[#3C3B6E] text-sm sm:text-base">Painel Administrativo</h1>
                <p className="text-xs text-gray-500 hidden sm:block">DS160 - Visto Americano</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/senhas')}
                className="h-9 sm:h-10 border-[#3C3B6E] text-[#3C3B6E] hover:bg-[#3C3B6E] hover:text-white"
              >
                <Key className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Senhas</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-9 sm:h-10">
                <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-[#B22234]" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{formularios.length}</p>
                  <p className="text-xs text-gray-500">Total Formulários</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{formularios.filter(f => f.status === 'pendente').length}</p>
                  <p className="text-xs text-gray-500">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{formularios.filter(f => f.status === 'processado').length}</p>
                  <p className="text-xs text-gray-500">Processados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#3C3B6E]" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{authorizedCPFs.length}</p>
                  <p className="text-xs text-gray-500">CPFs Autorizados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6">
          <Button
            variant={activeTab === 'formularios' ? 'default' : 'outline'}
            onClick={() => setActiveTab('formularios')}
            className={`${activeTab === 'formularios' ? 'bg-[#3C3B6E]' : ''} h-10 sm:h-9`}
          >
            <FileText className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Formulários</span>
          </Button>
          <Button
            variant={activeTab === 'cpfs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cpfs')}
            className={`${activeTab === 'cpfs' ? 'bg-[#3C3B6E]' : ''} h-10 sm:h-9`}
          >
            <Users className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">CPFs Autorizados</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por CPF ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-9"
              />
            </div>
          </div>
          {activeTab === 'formularios' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full sm:w-44 h-10 sm:h-9">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os períodos</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Última semana</SelectItem>
                  <SelectItem value="mes">Último mês</SelectItem>
                  <SelectItem value="trimestre">Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44 h-10 sm:h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="processado">Processado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'formularios' && (
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Formulários DS160</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {filteredFormularios.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum formulário encontrado</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 sm:px-2">Nome</th>
                        <th className="text-left py-3 px-4 sm:px-2">CPF</th>
                        <th className="text-left py-3 px-4 sm:px-2">Email</th>
                        <th className="text-left py-3 px-4 sm:px-2">Data</th>
                        <th className="text-left py-3 px-4 sm:px-2">Status</th>
                        <th className="text-right py-3 px-4 sm:px-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueFormularios.map(form => (
                        <tr key={form.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 sm:px-2 text-sm font-medium">
                            {form.nome || `${form.dados?.firstName || ''} ${form.dados?.lastName || ''}`.trim() || '-'}
                          </td>
                          <td className="py-3 px-4 sm:px-2 font-mono text-sm">
                            {formatCPFDisplay(form.cpf)}
                          </td>
                          <td className="py-3 px-4 sm:px-2 text-sm text-gray-600">
                            {form.dados?.email || '-'}
                          </td>
                          <td className="py-3 px-4 sm:px-2 text-sm text-gray-500">
                            {formatDate(form.createdAt)}
                          </td>
                          <td className="py-3 px-4 sm:px-2">
                            <Select
                              value={form.status}
                              onValueChange={(value) => updateFormStatus(form.id, value, form.cpf)}
                            >
                              <SelectTrigger className={`h-8 w-32 ${
                                form.status === 'pendente' ? 'border-yellow-400 bg-yellow-50' :
                                form.status === 'processado' ? 'border-green-400 bg-green-50' :
                                'border-gray-300 bg-gray-50'
                              }`}>
                                <span className={`font-medium ${
                                  form.status === 'pendente' ? 'text-yellow-700' :
                                  form.status === 'processado' ? 'text-green-700' :
                                  'text-gray-700'
                                }`}>
                                  {form.status?.toUpperCase()}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rascunho">RASCUNHO</SelectItem>
                                <SelectItem value="pendente">PENDENTE</SelectItem>
                                <SelectItem value="processado">PROCESSADO</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4 sm:px-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setSelectedForm(form); setShowDialog(true); }}
                                className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generatePDF(form)}
                                title="Exportar PDF"
                                className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                              >
                                <FileDown className="h-4 w-4 text-red-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateTXT(form)}
                                title="Baixar TXT"
                                className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'cpfs' && (
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">CPFs Autorizados</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {/* Add CPF */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
                <Input
                  placeholder="Digite o CPF (apenas números)"
                  value={newCPF}
                  onChange={(e) => setNewCPF(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full sm:max-w-xs h-10 sm:h-9"
                />
                <Button onClick={authorizeCPF} className="bg-[#B22234] hover:bg-[#8b1a28] h-10 sm:h-9">
                  <UserPlus className="h-4 w-4 mr-1" /> Autorizar CPF
                </Button>
              </div>

              <Alert className="mb-4 border-blue-300 bg-blue-50">
                <Key className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Senha padrão para novos CPFs:</strong> {DEFAULT_PASSWORD}
                </AlertDescription>
              </Alert>

              {filteredCPFs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum CPF autorizado</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 sm:px-2">CPF</th>
                        <th className="text-left py-3 px-4 sm:px-2">Conta</th>
                        <th className="text-left py-3 px-4 sm:px-2">Senha Padrão</th>
                        <th className="text-left py-3 px-4 sm:px-2">Status</th>
                        <th className="text-right py-3 px-4 sm:px-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCPFs.map(cpf => (
                        <tr key={cpf.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 sm:px-2 font-mono text-sm">
                            {formatCPFDisplay(cpf.cpf)}
                          </td>
                          <td className="py-3 px-4 sm:px-2">
                            {cpf.hasAccount && cpf.email ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Criada
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ Sem conta
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 sm:px-2 text-sm">
                            {cpf.hasAccount && cpf.email ? (
                              <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                                {DEFAULT_PASSWORD}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Criar conta primeiro</span>
                            )}
                          </td>
                          <td className="py-3 px-4 sm:px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cpf.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {cpf.blocked ? 'BLOQUEADO' : 'ATIVO'}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-2">
                            <div className="flex justify-end gap-1">
                              {!cpf.hasAccount || !cpf.email ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => createAccountForCPF(cpf)}
                                  title="Criar conta para este CPF"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 h-9 w-9 sm:h-8 sm:w-8 p-0"
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              ) : null}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(cpf)}
                                title="Editar CPF"
                                className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBlockCPF(cpf.cpf, cpf.blocked || false)}
                                title={cpf.blocked ? 'Desbloquear' : 'Bloquear'}
                                className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                              >
                                {cpf.blocked ? (
                                  <Unlock className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Lock className="h-4 w-4 text-yellow-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCPF(cpf.cpf)}
                                title="Remover CPF"
                                className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* View Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Detalhes do Formulário DS160</DialogTitle>
            <DialogDescription className="text-sm">
              CPF: {selectedForm?.cpf ? formatCPFDisplay(selectedForm.cpf) : '-'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedForm && (() => {
            const dados = selectedForm.dados as Record<string, unknown>;
            
            // Group fields into sections
            const sections = {
              pessoal: ['lastName', 'firstName', 'usedOtherName', 'oldLastName', 'oldFirstName', 'birthDate', 'birthCity', 'birthCountry', 'cpf', 'rg'],
              contato: ['address', 'city', 'contactState', 'zipCode', 'country', 'phone1', 'phone2', 'phoneProfessional', 'email', 'usedOtherPhones', 'otherPhones', 'usedOtherEmails', 'otherEmails'],
              correspondencia: ['sameAddress', 'corrStreet', 'corrNumber', 'corrComplement', 'corrNeighborhood', 'corrCity', 'corrState', 'corrZipCode', 'corrCountry'],
              sociais: ['hasSocialMedia', 'socialList'],
              passaporte: ['passportSeries', 'passportNumber', 'passportIssueDate', 'passportExpiryDate'],
              viagem: ['travelReason', 'hasTravelPlans', 'arrivalDate', 'stayDuration', 'placesToVisit', 'travelSponsor', 'sponsorName', 'sponsorPhone', 'sponsorRelation', 'usStreet', 'usCity', 'usState'],
              vistoAnterior: ['usTravelHistory', 'visaIssueDate', 'visaExpiryDate', 'visaNumber', 'lastArrivalDate', 'lastDepartureDate', 'visaDenied', 'visaDeniedReason'],
              familia: ['fatherName', 'fatherBirthDate', 'fatherInUSA', 'motherName', 'motherBirthDate', 'motherInUSA', 'relativesInUSA', 'relativeName', 'relativeRelation', 'spouseName', 'spouseBirthDate'],
              trabalho: ['jobTitle', 'companyName', 'companyAddress', 'companyCity', 'companyState', 'companyStartDate', 'jobDescription', 'companySalary'],
              outros: ['hasPrevJob', 'hasUniversity', 'traveledLast5Years', 'traveledCountry1', 'spokenLanguages', 'hasI20']
            };
            
            const fieldLabels: Record<string, string> = {
              lastName: 'Sobrenome', firstName: 'Nome', usedOtherName: 'Usou outro nome', oldLastName: 'Antigo sobrenome', oldFirstName: 'Antigo nome',
              birthDate: 'Data de nascimento', birthCity: 'Cidade de nascimento', birthCountry: 'País de nascimento', cpf: 'CPF', rg: 'RG',
              address: 'Endereço', city: 'Cidade', contactState: 'Estado', zipCode: 'CEP', country: 'País',
              phone1: 'Telefone principal', phone2: 'Telefone opcional', phoneProfessional: 'Telefone profissional', email: 'E-mail',
              usedOtherPhones: 'Usou outros telefones', otherPhones: 'Outros telefones', usedOtherEmails: 'Usou outros e-mails', otherEmails: 'Outros e-mails',
              sameAddress: 'Mesmo endereço', corrStreet: 'Rua', corrNumber: 'Número', corrComplement: 'Complemento', corrNeighborhood: 'Bairro',
              corrCity: 'Cidade', corrState: 'Estado', corrZipCode: 'CEP', corrCountry: 'País',
              hasSocialMedia: 'Possui redes sociais', socialList: 'Redes sociais',
              passportSeries: 'Série', passportNumber: 'Número', passportIssueDate: 'Data de emissão', passportExpiryDate: 'Data de expiração',
              travelReason: 'Motivo da viagem', hasTravelPlans: 'Planos específicos', arrivalDate: 'Data de chegada', stayDuration: 'Tempo de permanência',
              placesToVisit: 'Locais a visitar', travelSponsor: 'Patrocinador', sponsorName: 'Nome do patrocinador', sponsorPhone: 'Telefone do patrocinador',
              sponsorRelation: 'Relação', usStreet: 'Rua nos EUA', usCity: 'Cidade nos EUA', usState: 'Estado nos EUA',
              usTravelHistory: 'Já teve visto', visaIssueDate: 'Data de emissão do visto', visaExpiryDate: 'Data de expiração', visaNumber: 'Número do visto',
              lastArrivalDate: 'Última chegada', lastDepartureDate: 'Última saída', visaDenied: 'Visto negado', visaDeniedReason: 'Motivo da negação',
              fatherName: 'Nome do pai', fatherBirthDate: 'Data nasc. pai', fatherInUSA: 'Pai nos EUA',
              motherName: 'Nome da mãe', motherBirthDate: 'Data nasc. mãe', motherInUSA: 'Mãe nos EUA',
              relativesInUSA: 'Parentes nos EUA', relativeName: 'Nome do parente', relativeRelation: 'Relação',
              spouseName: 'Nome do cônjuge', spouseBirthDate: 'Data nasc. cônjuge',
              jobTitle: 'Ocupação', companyName: 'Empresa', companyAddress: 'Endereço', companyCity: 'Cidade', companyState: 'Estado',
              companyStartDate: 'Data de início', jobDescription: 'Descrição', companySalary: 'Salário',
              hasPrevJob: 'Teve emprego anterior', hasUniversity: 'Frequentou universidade', traveledLast5Years: 'Viajou últimos 5 anos',
              traveledCountry1: 'Países visitados', spokenLanguages: 'Idiomas', hasI20: 'Possui I-20'
            };
            
            const sectionLabels: Record<string, string> = {
              pessoal: 'Informações Pessoais',
              contato: 'Informações de Contato',
              correspondencia: 'Endereço de Correspondência',
              sociais: 'Redes Sociais',
              passaporte: 'Passaporte',
              viagem: 'Informações da Viagem',
              vistoAnterior: 'Vistos Anteriores',
              familia: 'Informações Familiares',
              trabalho: 'Informações Profissionais',
              outros: 'Outras Informações'
            };
            
            const formatValue = (key: string, value: unknown): string => {
              if (!value) return '-';
              if (Array.isArray(value)) {
                if (value.length === 0) return '-';
                return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
              }
              if (typeof value === 'string') {
                if (value.match(/^\d{4}-\d{2}-\d{2}$/)) return formatDateToBrazilian(value);
                return value;
              }
              return String(value);
            };
            
            const getSectionFields = (sectionKey: string) => {
              const fields = sections[sectionKey as keyof typeof sections] || [];
              return fields
                .map(key => ({ key, label: fieldLabels[key] || key, value: dados[key] }))
                .filter(f => f.value && (typeof f.value === 'string' ? f.value.trim() !== '' : true) && (!Array.isArray(f.value) || f.value.length > 0));
            };
            
            return (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                  <div><strong>CPF:</strong> {selectedForm.cpf ? formatCPFDisplay(selectedForm.cpf) : '-'}</div>
                  <div><strong>Status:</strong> <span className={`font-medium ${selectedForm.status === 'pendente' ? 'text-yellow-600' : selectedForm.status === 'processado' ? 'text-green-600' : 'text-gray-600'}`}>{selectedForm.status?.toUpperCase()}</span></div>
                  <div><strong>Data:</strong> {formatDate(selectedForm.createdAt)}</div>
                </div>

                {Object.keys(sections).map(sectionKey => {
                  const fields = getSectionFields(sectionKey);
                  if (fields.length === 0) return null;
                  
                  return (
                    <div key={sectionKey} className="border rounded-lg overflow-hidden">
                      <div className="bg-[#3C3B6E] text-white px-4 py-2 font-semibold text-sm">
                        {sectionLabels[sectionKey]}
                      </div>
                      <div className="divide-y">
                        {fields.map(f => (
                          <div key={f.key} className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 py-2 text-sm">
                            <div className="font-medium text-gray-600">{f.label}</div>
                            <div className="col-span-1 sm:col-span-2 text-gray-800">{formatValue(f.key, f.value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">
                    Fechar
                  </Button>
                  <Button onClick={() => generatePDF(selectedForm)} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                    <FileDown className="h-4 w-4 mr-1" /> Exportar PDF
                  </Button>
                  <Button onClick={() => generateTXT(selectedForm)} className="bg-[#3C3B6E] w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-1" /> Baixar TXT
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit CPF Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Alterar CPF</DialogTitle>
            <DialogDescription className="text-sm">
              CPF atual: {editingCPF?.cpf ? formatCPFDisplay(editingCPF.cpf) : '-'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCPF">Novo CPF</Label>
              <Input
                id="newCPF"
                value={newCPFValue ? maskCPF(newCPFValue) : ''}
                onChange={(e) => setNewCPFValue(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="h-10 sm:h-9"
              />
            </div>

            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <AlertDescription className="text-yellow-800 text-sm">
                Atenção: Esta ação irá atualizar o CPF em todos os registros relacionados 
                (formulários, usuário, etc).
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={updateCPF} className="bg-[#B22234] hover:bg-[#8b1a28] w-full sm:w-auto">
              Salvar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Alterar Senha</DialogTitle>
            <DialogDescription className="text-sm">
              CPF: {editingCPF?.cpf ? formatCPFDisplay(editingCPF.cpf) : '-'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="h-10 sm:h-9"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={resetPassword} className="bg-[#B22234] hover:bg-[#8b1a28] w-full sm:w-auto">
              Alterar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
