'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  User,
  CreditCard,
  Phone,
  MapPin,
  Briefcase,
  Plane,
  Users,
  FileText,
  Globe,
  GraduationCap,
  AlertCircle,
  LogOut,
  CheckCircle2,
  Loader2,
  XCircle,
  Save,
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import { removeAccents, formatDateToBrazilian, formatDateForTXT, cleanPhone, cleanCEP, APPLICATION_LOCATIONS, SOCIAL_PLATFORMS, maskCPF, getBrazilDateTimeString, maskCEP } from '@/lib/masks';
import { toast } from 'sonner';

interface PrevJob {
  jobTitle: string;
  companyName: string;
  companyAddress: string;
  companyNeighborhood: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyCountry: string;
  jobDescription: string;
  companySalary: string;
  supervisorName: string;
  startDate: string;
  endDate: string;
}

interface Companion {
  lastName: string;
  firstName: string;
  relationship: string;
}

interface School {
  name: string;
  course: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  startDate: string;
  endDate: string;
}

interface FormData {
  // Section 0
  applicationLocation: string;
  // Section 1
  lastName: string;
  firstName: string;
  usedOtherName: string;
  oldLastName: string;
  oldFirstName: string;
  birthDate: string;
  birthCity: string;
  birthCountry: string;
  cpf: string;
  rg: string;
  maritalStatus: string;
  // Section 2
  address: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string;
  city: string;
  contactState: string;
  zipCode: string;
  country: string;
  phone1: string;
  phone2: string;
  phoneProfessional: string;
  email: string;
  usedOtherPhones: string;
  otherPhones: string;
  usedOtherEmails: string;
  otherEmails: string;
  // Section 3
  sameAddress: string;
  corrStreet: string;
  corrNumber: string;
  corrComplement: string;
  corrNeighborhood: string;
  corrCity: string;
  corrState: string;
  corrZipCode: string;
  corrCountry: string;
  // Section 4
  hasSocialMedia: string;
  socialList: Array<{ platform: string; username: string }>;
  // Section 5
  passportSeries: string;
  passportNumber: string;
  passportIssueDate: string;
  passportIssueCity: string;
  passportIssueState: string;
  passportExpiryDate: string;
  // Section 6
  travelReason: string;
  hasTravelPlans: string;
  knowsArrivalDate: string;
  arrivalDate: string;
  stayDuration: string;
  placesToVisit: string;
  travelCity: string;
  travelState: string;
  travelSponsor: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorEmail: string;
  sponsorRelation: string;
  sponsorCity: string;
  sponsorState: string;
  sponsorZipCode: string;
  sponsorCountry: string;
  knowsUSAddress: string;
  usStreet: string;
  usNumber: string;
  usComplement: string;
  usCity: string;
  usState: string;
  usZipCode: string;
  usCountry: string;
  travelCompanions: string;
  isGroup: string;
  groupName: string;
  companionsList: Companion[];
  // Section 7
  usTravelHistory: string;
  visaIssueDate: string;
  visaExpiryDate: string;
  visaNumber: string;
  lastArrivalDate: string;
  lastDepartureDate: string;
  secondLastArrivalDate: string;
  secondLastDepartureDate: string;
  visaDenied: string;
  visaDeniedReason: string;
  // Section 8
  fatherLastName: string;
  fatherFirstName: string;
  fatherBirthDate: string;
  fatherInUSA: string;
  fatherUSAAddress: string;
  fatherUSAZipCode: string;
  fatherUSAPhone: string;
  fatherUSAEmail: string;
  motherLastName: string;
  motherFirstName: string;
  motherBirthDate: string;
  motherInUSA: string;
  motherUSAAddress: string;
  motherUSAZipCode: string;
  motherUSAPhone: string;
  motherUSAEmail: string;
  relativesInUSA: string;
  relativeName: string;
  relativeRelation: string;
  relativeCompany: string;
  relativeAddress: string;
  relativeCity: string;
  relativeState: string;
  relativeZipCode: string;
  relativePhone: string;
  relativeEmail: string;
  isCurrentlyMarried: string;
  spouseName: string;
  spouseBirthDate: string;
  spouseBirthCityState: string;
  spouseSameAddress: string;
  spouseStreet: string;
  spouseNumber: string;
  spouseComplement: string;
  spouseNeighborhood: string;
  spouseCity: string;
  spouseState: string;
  spouseZipCode: string;
  wasMarried: string;
  exSpouseName: string;
  exSpouseBirthDate: string;
  exSpouseBirthCity: string;
  exSpouseBirthState: string;
  marriageDate: string;
  divorceDate: string;
  divorceCountry: string;
  divorceReason: string;
  // Section 9
  jobTitle: string;
  companyName: string;
  companyAddress: string;
  companyNumber: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyStartDate: string;
  jobDescription: string;
  companySalary: string;
  extraIncomeAmount: string;
  extraIncomeDescription: string;
  // Section 10
  hasPrevJob: string;
  prevJobsList: PrevJob[];
  // Section 11
  hasUniversity: string;
  universityName: string;
  universityAddress: string;
  universityNumber: string;
  universityCity: string;
  universityState: string;
  universityZip: string;
  universityCourse: string;
  universityStartDate: string;
  universityEndDate: string;
  schoolsList: School[];
  // Section 12
  traveledLast5Years: string;
  traveledCountry1: string;
  spokenLanguages: string;
  // Section 13
  hasI20: string;
  i20Number: string;
  i20SchoolName: string;
  i20Course: string;
  i20CoursePeriod: string;
  i20SchoolPhone: string;
  i20SchoolEmail: string;
}

const initialFormData: FormData = {
  applicationLocation: '',
  lastName: '',
  firstName: '',
  usedOtherName: '',
  oldLastName: '',
  oldFirstName: '',
  birthDate: '',
  birthCity: '',
  birthCountry: 'BRASIL',
  cpf: '',
  rg: '',
  maritalStatus: '',
  address: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  contactState: '',
  zipCode: '',
  country: 'BRASIL',
  phone1: '',
  phone2: '',
  phoneProfessional: '',
  email: '',
  usedOtherPhones: '',
  otherPhones: '',
  usedOtherEmails: '',
  otherEmails: '',
  sameAddress: '',
  corrStreet: '',
  corrNumber: '',
  corrComplement: '',
  corrNeighborhood: '',
  corrCity: '',
  corrState: '',
  corrZipCode: '',
  corrCountry: 'BRASIL',
  hasSocialMedia: '',
  socialList: [],
  passportSeries: '',
  passportNumber: '',
  passportIssueDate: '',
  passportIssueCity: '',
  passportIssueState: '',
  passportExpiryDate: '',
  travelReason: '',
  hasTravelPlans: '',
  knowsArrivalDate: '',
  arrivalDate: '',
  stayDuration: '',
  placesToVisit: '',
  travelCity: '',
  travelState: '',
  travelSponsor: '',
  sponsorName: '',
  sponsorPhone: '',
  sponsorEmail: '',
  sponsorRelation: '',
  sponsorCity: '',
  sponsorState: '',
  sponsorZipCode: '',
  sponsorCountry: 'BRASIL',
  knowsUSAddress: '',
  usStreet: '',
  usNumber: '',
  usComplement: '',
  usCity: '',
  usState: '',
  usZipCode: '',
  usCountry: 'ESTADOS UNIDOS',
  travelCompanions: '',
  isGroup: '',
  groupName: '',
  companionsList: [],
  usTravelHistory: '',
  visaIssueDate: '',
  visaExpiryDate: '',
  visaNumber: '',
  lastArrivalDate: '',
  lastDepartureDate: '',
  secondLastArrivalDate: '',
  secondLastDepartureDate: '',
  visaDenied: '',
  visaDeniedReason: '',
  fatherLastName: '',
  fatherFirstName: '',
  fatherBirthDate: '',
  fatherInUSA: '',
  fatherUSAAddress: '',
  fatherUSAZipCode: '',
  fatherUSAPhone: '',
  fatherUSAEmail: '',
  motherLastName: '',
  motherFirstName: '',
  motherBirthDate: '',
  motherInUSA: '',
  motherUSAAddress: '',
  motherUSAZipCode: '',
  motherUSAPhone: '',
  motherUSAEmail: '',
  relativesInUSA: '',
  relativeName: '',
  relativeRelation: '',
  relativeCompany: '',
  relativeAddress: '',
  relativeCity: '',
  relativeState: '',
  relativeZipCode: '',
  relativePhone: '',
  relativeEmail: '',
  isCurrentlyMarried: '',
  spouseName: '',
  spouseBirthDate: '',
  spouseBirthCityState: '',
  spouseSameAddress: '',
  spouseStreet: '',
  spouseNumber: '',
  spouseComplement: '',
  spouseNeighborhood: '',
  spouseCity: '',
  spouseState: '',
  spouseZipCode: '',
  wasMarried: '',
  exSpouseName: '',
  exSpouseBirthDate: '',
  exSpouseBirthCity: '',
  exSpouseBirthState: '',
  marriageDate: '',
  divorceDate: '',
  divorceCountry: '',
  divorceReason: '',
  jobTitle: '',
  companyName: '',
  companyAddress: '',
  companyNumber: '',
  companyCity: '',
  companyState: '',
  companyZip: '',
  companyPhone: '',
  companyStartDate: '',
  jobDescription: '',
  companySalary: '',
  extraIncomeAmount: '',
  extraIncomeDescription: '',
  hasPrevJob: '',
  prevJobsList: [],
  hasUniversity: '',
  universityName: '',
  universityAddress: '',
  universityNumber: '',
  universityCity: '',
  universityState: '',
  universityZip: '',
  universityCourse: '',
  universityStartDate: '',
  universityEndDate: '',
  schoolsList: [],
  traveledLast5Years: '',
  traveledCountry1: '',
  spokenLanguages: '',
  hasI20: '',
  i20Number: '',
  i20SchoolName: '',
  i20Course: '',
  i20CoursePeriod: '',
  i20SchoolPhone: '',
  i20SchoolEmail: '',
};

export default function FormularioPage() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [loadingForm, setLoadingForm] = useState(true);
  const [existingFormId, setExistingFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Ref para manter o valor atual do formData para o auto-save
  const formDataRef = useRef(formData);
  const existingFormIdRef = useRef(existingFormId);
  
  // Atualizar refs quando os estados mudam
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  
  useEffect(() => {
    existingFormIdRef.current = existingFormId;
  }, [existingFormId]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    if (!loading && user && userData?.cpf) {
      loadFormData();
    }
  }, [user, loading, router, userData]);

  const loadFormData = async () => {
    try {
      const cpfNumeros = userData?.cpf?.replace(/\D/g, '') || '';
      
      // Check if blocked
      const cpfDoc = await getDoc(doc(db, 'authorized_cpfs', cpfNumeros));
      if (cpfDoc.exists() && cpfDoc.data().blocked) {
        setBlocked(true);
        setLoadingForm(false);
        return;
      }

      // Check for existing form
      const formsQuery = query(
        collection(db, 'ds160_forms'),
        where('cpf', '==', cpfNumeros),
        limit(1)
      );

      const formsSnapshot = await getDocs(formsQuery);

      if (!formsSnapshot.empty) {
        const formDoc = formsSnapshot.docs[0];
        const data = formDoc.data();

        if (data.status === 'processado') {
          setBlocked(true);
          setLoadingForm(false);
          return;
        }

        // Carregar dados existentes para rascunho ou pendente
        if ((data.status === 'pendente' || data.status === 'rascunho') && data.dados) {
          setExistingFormId(formDoc.id);
          existingFormIdRef.current = formDoc.id;
          const loadedData = { ...initialFormData, ...data.dados };
          setFormData(loadedData);
          formDataRef.current = loadedData;
        }
      } else {
        // Pre-fill CPF apenas se não há formulário existente
        if (cpfNumeros) {
          const newData = { ...initialFormData, cpf: maskCPF(cpfNumeros) };
          setFormData(newData);
          formDataRef.current = newData;
        }
      }
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoadingForm(false);
    }
  };

  // Salvar rascunho manualmente
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveDraft = useCallback(async () => {
    if (!user || !userData?.cpf || blocked) return;

    setSaving(true);
    try {
      const currentFormData = formDataRef.current;
      const currentFormId = existingFormIdRef.current;
      const cleanedData = { ...currentFormData };
      const nomeCompleto = `${currentFormData.firstName} ${currentFormData.lastName}`.trim();

      if (currentFormId) {
        await updateDoc(doc(db, 'ds160_forms', currentFormId), {
          dados: cleanedData,
          nome: nomeCompleto,
          updatedAt: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, 'ds160_forms'), {
          userId: user.uid,
          cpf: userData.cpf.replace(/\D/g, ''),
          nome: nomeCompleto,
          dados: cleanedData,
          createdAt: serverTimestamp(),
          status: 'rascunho'
        });
        setExistingFormId(docRef.id);
        existingFormIdRef.current = docRef.id;
      }

      // Atualizar nome do cliente no documento authorized_cpfs
      try {
        const cpfNumeros = userData.cpf.replace(/\D/g, '');
        await updateDoc(doc(db, 'authorized_cpfs', cpfNumeros), {
          nome: nomeCompleto
        });
      } catch (e) {
        // Falha ao atualizar o nome não deve impedir o salvamento
        console.error('Erro ao atualizar nome no authorized_cpfs:', e);
      }

      setLastSaved(new Date());
      toast.success('Informações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Erro ao salvar informações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [user, userData, blocked]);



  const handleInputChange = (field: keyof FormData, value: string) => {
    // Se o valor parece ser uma data no formato ISO (YYYY-MM-DD), não aplica transformações
    // Isso evita problemas de fuso horário e mantém a data exata que o usuário selecionou
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: removeAccents(value.toUpperCase())
    }));
  };

  // Handler para campos de email - mantém minúsculas
  const handleEmailChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.toLowerCase().trim()
    }));
  };

  // Formata valor monetário brasileiro (R$)
  const maskCurrencyBR = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 2) {
      return `0,${digits.padStart(2, '0')}`;
    }
    const integer = digits.slice(0, -2);
    const decimal = digits.slice(-2);
    const formattedInt = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInt},${decimal}`;
  };

  const handleSalaryChange = (field: keyof FormData, value: string) => {
    const masked = maskCurrencyBR(value);
    setFormData(prev => ({
      ...prev,
      [field]: masked
    }));
  };

  // Handler específico para campos de data - não aplica transformações
  const handleDateChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value // Mantém o valor ISO exatamente como vem do input date
    }));
  };

  // Handler para selects - não converte para maiúsculas
  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Função para validar campos obrigatórios antes de enviar
  const validateRequiredFields = (): string[] => {
    const errors: string[] = [];

    // Seção 0
    if (!formData.applicationLocation) errors.push('Local de Solicitação');

    // Seção 1 - Informações Pessoais
    if (!formData.lastName) errors.push('Sobrenome');
    if (!formData.firstName) errors.push('Nome');
    if (!formData.birthDate) errors.push('Data de Nascimento');
    if (!formData.birthCity) errors.push('Cidade/Estado de Nascimento');
    if (!formData.maritalStatus) errors.push('Estado Civil');

    // Seção 2 - Contato
    if (!formData.address) errors.push('Endereço');
    if (!formData.addressNumber) errors.push('Número do endereço');
    if (!formData.neighborhood) errors.push('Bairro');
    if (!formData.city) errors.push('Cidade');
    if (!formData.contactState) errors.push('Estado');
    if (!formData.zipCode) errors.push('CEP');
    if (!formData.phone1) errors.push('Telefone Principal');
    if (!formData.email) errors.push('E-mail');

    // Seção 3 - Endereço de Correspondência
    if (!formData.sameAddress) errors.push('Endereço de correspondência é o mesmo?');
    
    // Se NÃO para endereço de correspondência, campos são obrigatórios
    if (formData.sameAddress === 'NAO') {
      if (!formData.corrStreet) errors.push('Rua (End. Correspondência)');
      if (!formData.corrNumber) errors.push('Número (End. Correspondência)');
      if (!formData.corrCity) errors.push('Cidade (End. Correspondência)');
      if (!formData.corrState) errors.push('Estado (End. Correspondência)');
      if (!formData.corrZipCode) errors.push('CEP (End. Correspondência)');
    }

    // Seção 4 - Redes Sociais
    if (!formData.hasSocialMedia) errors.push('Possui redes sociais?');
    
    // Se SIM para redes sociais, deve ter pelo menos uma rede informada com plataforma e usuário
    if (formData.hasSocialMedia === 'SIM') {
      if (formData.socialList.length === 0) {
        errors.push('Adicione pelo menos uma rede social');
      } else {
        formData.socialList.forEach((social, index) => {
          if (!social.platform) errors.push(`Rede social ${index + 1}: Plataforma`);
          if (!social.username) errors.push(`Rede social ${index + 1}: Nome de usuário`);
        });
      }
    }

    // Seção 5 - Passaporte
    if (!formData.passportSeries) errors.push('Série do Passaporte');
    if (!formData.passportNumber) errors.push('Número do Passaporte');
    if (!formData.passportIssueDate) errors.push('Data de Emissão do Passaporte');
    if (!formData.passportExpiryDate) errors.push('Data de Expiração do Passaporte');
    if (!formData.passportIssueCity) errors.push('Cidade de Emissão do Passaporte');
    if (!formData.passportIssueState) errors.push('Estado de Emissão do Passaporte');

    // Seção 6 - Viagem
    if (!formData.travelReason) errors.push('Motivo da viagem');
    if (!formData.hasTravelPlans) errors.push('Possui planos específicos?');
    if (!formData.knowsArrivalDate) errors.push('Sabe a data de chegada?');
    if (formData.knowsArrivalDate === 'SIM' && !formData.arrivalDate) errors.push('Data de chegada pretendida');
    if (!formData.knowsUSAddress) errors.push('Sabe o endereço nos EUA?');
    if (formData.travelSponsor === 'OUTROS') {
      if (!formData.sponsorName) errors.push('Nome do Patrocinador');
      if (!formData.sponsorPhone) errors.push('Telefone do Patrocinador');
      if (!formData.sponsorEmail) errors.push('E-mail do Patrocinador');
      if (!formData.sponsorRelation) errors.push('Relação com o Patrocinador');
      if (!formData.sponsorCity) errors.push('Cidade do Patrocinador');
      if (!formData.sponsorState) errors.push('Estado do Patrocinador');
      if (!formData.sponsorZipCode) errors.push('CEP do Patrocinador');
      if (!formData.sponsorCountry) errors.push('País do Patrocinador');
    }
    if (!formData.travelCompanions) errors.push('Existem pessoas que irão viajar com você?');
    if (formData.travelCompanions === 'SIM' && !formData.isGroup) errors.push('É grupo ou organização?');

    // Seção 7 - Vistos Anteriores
    if (!formData.usTravelHistory) errors.push('Já teve visto para os EUA?');

    // Seção 8 - Informações Familiares
    // Pai - campos obrigatórios
    if (!formData.fatherLastName) errors.push('Sobrenome do pai');
    if (!formData.fatherFirstName) errors.push('Nome do pai');
    if (!formData.fatherBirthDate) errors.push('Data de nascimento do pai');
    if (!formData.fatherInUSA) errors.push('Pai está nos EUA?');
    
    // Se SIM para pai nos EUA, campos de endereço são obrigatórios
    if (formData.fatherInUSA === 'SIM') {
      if (!formData.fatherUSAAddress) errors.push('Endereço do pai nos EUA');
      if (!formData.fatherUSAZipCode) errors.push('Zip Code do pai');
      if (!formData.fatherUSAPhone) errors.push('Telefone do pai nos EUA');
      if (!formData.fatherUSAEmail) errors.push('E-mail do pai');
    }
    
    // Mãe - campos obrigatórios
    if (!formData.motherLastName) errors.push('Sobrenome da mãe');
    if (!formData.motherFirstName) errors.push('Nome da mãe');
    if (!formData.motherBirthDate) errors.push('Data de nascimento da mãe');
    if (!formData.motherInUSA) errors.push('Mãe está nos EUA?');
    
    // Se SIM para mãe nos EUA, campos de endereço são obrigatórios
    if (formData.motherInUSA === 'SIM') {
      if (!formData.motherUSAAddress) errors.push('Endereço da mãe nos EUA');
      if (!formData.motherUSAZipCode) errors.push('Zip Code da mãe');
      if (!formData.motherUSAPhone) errors.push('Telefone da mãe nos EUA');
      if (!formData.motherUSAEmail) errors.push('E-mail da mãe');
    }
    
    if (!formData.relativesInUSA) errors.push('Possui parentes nos EUA?');
    
    // Se SIM para parentes nos EUA, campos são obrigatórios
    if (formData.relativesInUSA === 'SIM') {
      if (!formData.relativeName) errors.push('Nome do parente');
      if (!formData.relativeRelation) errors.push('Relação com o parente');
      if (!formData.relativeEmail) errors.push('E-mail do parente');
    }

    if (!formData.isCurrentlyMarried) errors.push('É casado(a) atualmente?');
    
    if (!formData.wasMarried) errors.push('Já foi casado(a)?');
    
    // Se SIM para casamento anterior, TODOS os campos são obrigatórios
    if (formData.wasMarried === 'SIM') {
      if (!formData.exSpouseName) errors.push('Nome do ex-cônjuge');
      if (!formData.exSpouseBirthDate) errors.push('Data de nascimento do ex-cônjuge');
      if (!formData.exSpouseBirthCity) errors.push('Cidade de nascimento do ex-cônjuge');
      if (!formData.exSpouseBirthState) errors.push('Estado de nascimento do ex-cônjuge');
      if (!formData.marriageDate) errors.push('Data do casamento');
      if (!formData.divorceDate) errors.push('Data do divórcio');
      if (!formData.divorceCountry) errors.push('País do divórcio');
      if (!formData.divorceReason) errors.push('Motivo do divórcio');
    }

    // Seção 9 - Ocupação Atual
    if (!formData.jobTitle) errors.push('Ocupação');
    if (!formData.companyName) errors.push('Nome da Empresa/Escola');
    if (!formData.companyAddress) errors.push('Endereço da Empresa');
    if (!formData.companyNumber) errors.push('Número da Empresa');
    if (!formData.companyCity) errors.push('Cidade da Empresa');
    if (!formData.companyState) errors.push('Estado da Empresa');
    if (!formData.companyZip) errors.push('CEP da Empresa');
    if (!formData.companyStartDate) errors.push('Data de início');
    // Remuneração não é obrigatória se for estudante
    if (formData.jobTitle && formData.jobTitle.toUpperCase().includes('ESTUDANTE') === false && !formData.companySalary) errors.push('Remuneração');
    if (!formData.jobDescription) errors.push('Descrição das funções');

    // Seção 10 - Ocupação Anterior
    if (!formData.hasPrevJob) errors.push('Teve ocupação anterior?');
    
    // Se SIM para ocupação anterior, deve ter pelo menos uma ocupação informada
    if (formData.hasPrevJob === 'SIM') {
      if (formData.prevJobsList.length === 0) {
        errors.push('Adicione pelo menos uma ocupação anterior');
      } else {
        formData.prevJobsList.forEach((job, index) => {
          if (!job.jobTitle) errors.push(`Ocupação anterior ${index + 1}: Ocupação`);
          if (!job.companyName) errors.push(`Ocupação anterior ${index + 1}: Nome da Empresa`);
          if (!job.companyAddress) errors.push(`Ocupação anterior ${index + 1}: Endereço`);
          if (!job.companyCity) errors.push(`Ocupação anterior ${index + 1}: Cidade`);
          if (!job.companyState) errors.push(`Ocupação anterior ${index + 1}: Estado`);
          if (!job.companyZip) errors.push(`Ocupação anterior ${index + 1}: CEP`);
          if (!job.startDate) errors.push(`Ocupação anterior ${index + 1}: Data de início`);
          if (!job.endDate) errors.push(`Ocupação anterior ${index + 1}: Data de término`);
          if (!job.jobDescription) errors.push(`Ocupação anterior ${index + 1}: Descrição das funções`);
          if (!job.supervisorName) errors.push(`Ocupação anterior ${index + 1}: Nome do supervisor`);
        });
      }
    }

    // Seção 11 - Universitário
    if (!formData.hasUniversity) errors.push('Frequentou escola ou universidade?');
    if (formData.hasUniversity === 'SIM' && !formData.universityNumber) errors.push('Número (Universitário)');

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    const errors = validateRequiredFields();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error(`Preencha os campos obrigatórios: ${errors.slice(0, 5).join(', ')}${errors.length > 5 ? ` e mais ${errors.length - 5} campos` : ''}`, {
        duration: 8000,
      });
      // Rolar para o topo do formulário para mostrar os erros
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);
    setShowReview(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);

    try {
      // Nome completo do cliente
      const nomeCompleto = `${formData.firstName} ${formData.lastName}`.trim();

      // Limpar dados antes de salvar - garantir que arrays são arrays
      const cleanedData = {
        ...formData,
        socialList: Array.isArray(formData.socialList) ? formData.socialList : [],
        prevJobsList: Array.isArray(formData.prevJobsList) ? formData.prevJobsList : [],
        companionsList: Array.isArray(formData.companionsList) ? formData.companionsList : [],
        schoolsList: Array.isArray(formData.schoolsList) ? formData.schoolsList : [],
      };

      if (existingFormId) {
        await updateDoc(doc(db, 'ds160_forms', existingFormId), {
          dados: cleanedData,
          nome: nomeCompleto,
          updatedAt: serverTimestamp(),
          status: 'pendente'
        });
      } else {
        await addDoc(collection(db, 'ds160_forms'), {
          userId: user?.uid,
          cpf: userData?.cpf?.replace(/\D/g, ''),
          nome: nomeCompleto,
          dados: cleanedData,
          createdAt: serverTimestamp(),
          status: 'pendente'
        });
      }

      // Atualizar nome do cliente no documento authorized_cpfs
      try {
        const cpfNumeros = userData?.cpf?.replace(/\D/g, '');
        if (cpfNumeros) {
          await updateDoc(doc(db, 'authorized_cpfs', cpfNumeros), {
            nome: nomeCompleto
          });
        }
      } catch (e) {
        console.error('Erro ao atualizar nome no authorized_cpfs:', e);
      }

      setSuccess(true);
      setShowReview(false);
      toast.success('Formulário enviado com sucesso!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const addSocialMedia = () => {
    setFormData(prev => ({
      ...prev,
      socialList: [...prev.socialList, { platform: '', username: '' }]
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialList: prev.socialList.filter((_, i) => i !== index)
    }));
  };

  const updateSocialMedia = (index: number, field: 'platform' | 'username', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialList: prev.socialList.map((item, i) =>
        i === index ? { ...item, [field]: field === 'platform' ? value : value.toLowerCase().trim() } : item
      )
    }));
  };

  // Companions management
  const addCompanion = () => {
    setFormData(prev => ({
      ...prev,
      companionsList: [...prev.companionsList, { lastName: '', firstName: '', relationship: '' }]
    }));
  };

  const removeCompanion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      companionsList: prev.companionsList.filter((_, i) => i !== index)
    }));
  };

  const updateCompanion = (index: number, field: keyof Companion, value: string) => {
    setFormData(prev => ({
      ...prev,
      companionsList: prev.companionsList.map((item, i) =>
        i === index ? { ...item, [field]: removeAccents(value.toUpperCase()) } : item
      )
    }));
  };

  // Previous jobs management
  const emptyPrevJob: PrevJob = {
    jobTitle: '',
    companyName: '',
    companyAddress: '',
    companyNeighborhood: '',
    companyCity: '',
    companyState: '',
    companyZip: '',
    companyPhone: '',
    companyCountry: 'BRASIL',
    jobDescription: '',
    companySalary: '',
    supervisorName: '',
    startDate: '',
    endDate: ''
  };

  const addPrevJob = () => {
    setFormData(prev => ({
      ...prev,
      prevJobsList: [...prev.prevJobsList, { ...emptyPrevJob }]
    }));
  };

  const removePrevJob = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prevJobsList: prev.prevJobsList.filter((_, i) => i !== index)
    }));
  };

  const updatePrevJob = (index: number, field: keyof PrevJob, value: string) => {
    setFormData(prev => ({
      ...prev,
      prevJobsList: prev.prevJobsList.map((item, i) =>
        i === index ? { ...item, [field]: removeAccents(value.toUpperCase()) } : item
      )
    }));
  };

  // Schools management
  const emptySchool: School = {
    name: '',
    course: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    startDate: '',
    endDate: ''
  };

  const addSchool = () => {
    setFormData(prev => ({
      ...prev,
      schoolsList: [...prev.schoolsList, { ...emptySchool }]
    }));
  };

  const removeSchool = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schoolsList: prev.schoolsList.filter((_, i) => i !== index)
    }));
  };

  const updateSchool = (index: number, field: keyof School, value: string) => {
    setFormData(prev => ({
      ...prev,
      schoolsList: prev.schoolsList.map((item, i) =>
        i === index ? { ...item, [field]: removeAccents(value.toUpperCase()) } : item
      )
    }));
  };

  const lookupCEP = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) return;

      const toUpper = (s: string) => removeAccents((s || '').toUpperCase());
      setFormData(prev => ({
        ...prev,
        address: toUpper(data.logradouro),
        neighborhood: toUpper(data.bairro),
        city: toUpper(data.localidade),
        contactState: data.uf,
      }));
    } catch {
      // silently fail
    }
  }, []);

  const handleCEPChange = (field: 'zipCode' | 'corrZipCode', value: string) => {
    const masked = maskCEP(value);
    setFormData(prev => ({ ...prev, [field]: masked }));
    const clean = masked.replace(/\D/g, '');
    if (clean.length === 8 && field === 'zipCode') {
      lookupCEP(masked);
    }
  };

  const lookupCompanyCEP = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) return;
      const toUpper = (s: string) => removeAccents((s || '').toUpperCase());
      setFormData(prev => ({
        ...prev,
        companyAddress: toUpper(data.logradouro),
        companyCity: toUpper(data.localidade),
        companyState: data.uf,
      }));
    } catch {}
  }, []);

  const handleCompanyCEPChange = (value: string) => {
    const masked = maskCEP(value);
    setFormData(prev => ({ ...prev, companyZip: masked }));
    const clean = masked.replace(/\D/g, '');
    if (clean.length === 8) {
      lookupCompanyCEP(masked);
    }
  };

  const lookupPrevJobCEP = useCallback(async (index: number, cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) return;
      const toUpper = (s: string) => removeAccents((s || '').toUpperCase());
      setFormData(prev => ({
        ...prev,
        prevJobsList: prev.prevJobsList.map((item, i) =>
          i === index ? {
            ...item,
            companyAddress: toUpper(data.logradouro),
            companyNeighborhood: toUpper(data.bairro),
            companyCity: toUpper(data.localidade),
            companyState: data.uf,
          } : item
        )
      }));
    } catch {}
  }, []);

  const handlePrevJobCEPChange = (index: number, value: string) => {
    const masked = maskCEP(value);
    setFormData(prev => ({
      ...prev,
      prevJobsList: prev.prevJobsList.map((item, i) =>
        i === index ? { ...item, companyZip: masked } : item
      )
    }));
    const clean = masked.replace(/\D/g, '');
    if (clean.length === 8) {
      lookupPrevJobCEP(index, masked);
    }
  };

  const lookupUniversityCEP = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) return;
      const toUpper = (s: string) => removeAccents((s || '').toUpperCase());
      setFormData(prev => ({
        ...prev,
        universityAddress: toUpper(data.logradouro),
        universityCity: toUpper(data.localidade),
        universityState: data.uf,
      }));
    } catch {}
  }, []);

  const handleUniversityCEPChange = (value: string) => {
    const masked = maskCEP(value);
    setFormData(prev => ({ ...prev, universityZip: masked }));
    const clean = masked.replace(/\D/g, '');
    if (clean.length === 8) {
      lookupUniversityCEP(masked);
    }
  };

  const lookupSchoolCEP = useCallback(async (index: number, cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) return;
      const toUpper = (s: string) => removeAccents((s || '').toUpperCase());
      setFormData(prev => ({
        ...prev,
        schoolsList: prev.schoolsList.map((item, i) =>
          i === index ? {
            ...item,
            address: toUpper(data.logradouro),
            city: toUpper(data.localidade),
            state: data.uf,
          } : item
        )
      }));
    } catch {}
  }, []);

  const handleSchoolCEPChange = (index: number, value: string) => {
    const masked = maskCEP(value);
    setFormData(prev => ({
      ...prev,
      schoolsList: prev.schoolsList.map((item, i) =>
        i === index ? { ...item, zip: masked } : item
      )
    }));
    const clean = masked.replace(/\D/g, '');
    if (clean.length === 8) {
      lookupSchoolCEP(index, masked);
    }
  };

  const generateTXT = () => {
    const sections: { [key: string]: string[] } = {
      '0. LOCAL DE SOLICITAÇÃO': [],
      '1. INFORMAÇÕES PESSOAIS': [],
      '2. INFORMAÇÕES DE CONTATO': [],
      '3. ENDEREÇO DE CORRESPONDÊNCIA': [],
      '4. REDES SOCIAIS': [],
      '5. PASSAPORTE': [],
      '6. VIAGEM': [],
      '7. VISTOS ANTERIORES': [],
      '8. INFORMAÇÕES FAMILIARES': [],
      '9. OCUPAÇÃO ATUAL': [],
      '10. OCUPAÇÃO ANTERIOR': [],
      '11. UNIVERSITÁRIO': [],
      '12. VIAGENS INTERNACIONAIS': [],
      '13. DADOS DO I20': []
    };

    const addField = (section: string, label: string, value: string) => {
      if (value && value.trim() !== '') {
        sections[section].push(`${label}: ${value}`);
      }
    };

    // Helper para email minúsculo
    const emailToLower = (value: string) => value ? value.toLowerCase() : '';

    // CPF sem pontuação
    const cpfLimpo = formData.cpf.replace(/\D/g, '');

    // Section 0 - Local de Solicitação
    addField('0. LOCAL DE SOLICITAÇÃO', 'Local de Solicitação', formData.applicationLocation);

    // Section 1 - Informações Pessoais
    addField('1. INFORMAÇÕES PESSOAIS', 'Sobrenome', formData.lastName);
    addField('1. INFORMAÇÕES PESSOAIS', 'Nome', formData.firstName);
    addField('1. INFORMAÇÕES PESSOAIS', 'Utilizou outro nome', formData.usedOtherName);
    if (formData.usedOtherName === 'SIM') {
      addField('1. INFORMAÇÕES PESSOAIS', 'Antigo Sobrenome', formData.oldLastName);
      addField('1. INFORMAÇÕES PESSOAIS', 'Antigo Nome', formData.oldFirstName);
    }
    addField('1. INFORMAÇÕES PESSOAIS', 'Data de Nascimento', formatDateForTXT(formData.birthDate));
    addField('1. INFORMAÇÕES PESSOAIS', 'Cidade/Estado de Nascimento', formData.birthCity);
    addField('1. INFORMAÇÕES PESSOAIS', 'País de Nascimento', formData.birthCountry);
    addField('1. INFORMAÇÕES PESSOAIS', 'Estado Civil', formData.maritalStatus);
    addField('1. INFORMAÇÕES PESSOAIS', 'CPF', cpfLimpo);
    addField('1. INFORMAÇÕES PESSOAIS', 'RG', formData.rg);

    // Section 2 - Informações de Contato
    const enderecoCompleto = [formData.address, formData.addressNumber].filter(Boolean).join(', ');
    addField('2. INFORMAÇÕES DE CONTATO', 'Endereço', enderecoCompleto);
    addField('2. INFORMAÇÕES DE CONTATO', 'Complemento', formData.addressComplement);
    addField('2. INFORMAÇÕES DE CONTATO', 'Bairro', formData.neighborhood);
    addField('2. INFORMAÇÕES DE CONTATO', 'Cidade', formData.city);
    addField('2. INFORMAÇÕES DE CONTATO', 'Estado', formData.contactState);
    addField('2. INFORMAÇÕES DE CONTATO', 'CEP', cleanCEP(formData.zipCode));
    addField('2. INFORMAÇÕES DE CONTATO', 'País', formData.country);
    addField('2. INFORMAÇÕES DE CONTATO', 'Telefone Principal', cleanPhone(formData.phone1));
    addField('2. INFORMAÇÕES DE CONTATO', 'Telefone Opcional', cleanPhone(formData.phone2));
    addField('2. INFORMAÇÕES DE CONTATO', 'Telefone Profissional', cleanPhone(formData.phoneProfessional));
    addField('2. INFORMAÇÕES DE CONTATO', 'E-mail Principal', emailToLower(formData.email));
    addField('2. INFORMAÇÕES DE CONTATO', 'Utilizou outros telefones', formData.usedOtherPhones);
    if (formData.usedOtherPhones === 'SIM') {
      addField('2. INFORMAÇÕES DE CONTATO', 'Outros Telefones', cleanPhone(formData.otherPhones));
    }
    addField('2. INFORMAÇÕES DE CONTATO', 'Utilizou outros e-mails', formData.usedOtherEmails);
    if (formData.usedOtherEmails === 'SIM') {
      addField('2. INFORMAÇÕES DE CONTATO', 'Outros E-mails', emailToLower(formData.otherEmails));
    }

    // Section 3 - Endereço de Correspondência
    addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Endereço igual à residência', formData.sameAddress);
    if (formData.sameAddress === 'NAO') {
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Rua', formData.corrStreet);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Número', formData.corrNumber);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Complemento', formData.corrComplement);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Bairro', formData.corrNeighborhood);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Cidade', formData.corrCity);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Estado', formData.corrState);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'CEP', cleanCEP(formData.corrZipCode));
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'País', formData.corrCountry);
    }

    // Section 4 - Redes Sociais
    if (formData.socialList.length > 0) {
      formData.socialList.forEach((s, i) => {
        addField('4. REDES SOCIAIS', `${i + 1}. ${s.platform}`, s.username);
      });
    } else {
      addField('4. REDES SOCIAIS', 'Possui redes sociais', formData.hasSocialMedia);
    }

    // Section 5 - Passaporte
    const serieNumero = [formData.passportSeries, formData.passportNumber].filter(Boolean).join('');
    if (serieNumero) {
      addField('5. PASSAPORTE', 'Série/Número', serieNumero);
    }
    addField('5. PASSAPORTE', 'Cidade de Emissão', formData.passportIssueCity);
    addField('5. PASSAPORTE', 'Estado de Emissão', formData.passportIssueState);
    addField('5. PASSAPORTE', 'Data de Emissão', formatDateForTXT(formData.passportIssueDate));
    addField('5. PASSAPORTE', 'Data de Expiração', formatDateForTXT(formData.passportExpiryDate));

    // Section 6 - Viagem
    addField('6. VIAGEM', 'Motivo da Viagem', formData.travelReason);
    addField('6. VIAGEM', 'Possui planos específicos', formData.hasTravelPlans);
    addField('6. VIAGEM', 'Sabe a data de chegada', formData.knowsArrivalDate);
    if (formData.knowsArrivalDate === 'SIM') {
      addField('6. VIAGEM', 'Data de Chegada Pretendida', formatDateForTXT(formData.arrivalDate));
    }
    addField('6. VIAGEM', 'Tempo de Permanência', formData.stayDuration);
    addField('6. VIAGEM', 'Locais que deseja visitar', formData.placesToVisit);
    addField('6. VIAGEM', 'Quem patrocina a viagem', formData.travelSponsor);
    if (formData.travelSponsor === 'OUTROS') {
      addField('6. VIAGEM', 'Nome do Patrocinador', formData.sponsorName);
      addField('6. VIAGEM', 'Telefone do Patrocinador', cleanPhone(formData.sponsorPhone));
      addField('6. VIAGEM', 'E-mail do Patrocinador', emailToLower(formData.sponsorEmail));
      addField('6. VIAGEM', 'Relação com o Patrocinador', formData.sponsorRelation);
      addField('6. VIAGEM', 'Cidade do Patrocinador', formData.sponsorCity);
      addField('6. VIAGEM', 'Estado do Patrocinador', formData.sponsorState);
      addField('6. VIAGEM', 'CEP do Patrocinador', cleanCEP(formData.sponsorZipCode));
      addField('6. VIAGEM', 'País do Patrocinador', formData.sponsorCountry);
    }
    addField('6. VIAGEM', 'Sabe o endereço nos EUA', formData.knowsUSAddress);
    if (formData.knowsUSAddress === 'SIM') {
      addField('6. VIAGEM', 'Endereço nos EUA - Rua', formData.usStreet);
      addField('6. VIAGEM', 'Endereço nos EUA - Número', formData.usNumber);
      addField('6. VIAGEM', 'Endereço nos EUA - Complemento', formData.usComplement);
      addField('6. VIAGEM', 'Endereço nos EUA - Cidade', formData.usCity);
      addField('6. VIAGEM', 'Endereço nos EUA - Estado', formData.usState);
      addField('6. VIAGEM', 'Endereço nos EUA - CEP', cleanCEP(formData.usZipCode));
    }
    addField('6. VIAGEM', 'Viaja com companheiros', formData.travelCompanions);
    if (formData.travelCompanions === 'SIM') {
      addField('6. VIAGEM', 'É grupo ou organização', formData.isGroup);
      if (formData.isGroup === 'SIM') {
        addField('6. VIAGEM', 'Nome do Grupo', formData.groupName);
      } else if (formData.companionsList.length > 0) {
        formData.companionsList.forEach((companion, i) => {
          addField('6. VIAGEM', `Companheiro ${i + 1} - Sobrenome`, companion.lastName);
          addField('6. VIAGEM', `Companheiro ${i + 1} - Nome`, companion.firstName);
          addField('6. VIAGEM', `Companheiro ${i + 1} - Grau de Parentesco`, companion.relationship);
        });
      }
    }

    // Section 7 - Vistos Anteriores
    addField('7. VISTOS ANTERIORES', 'Já possuiu visto para os EUA', formData.usTravelHistory);
    if (formData.usTravelHistory === 'SIM') {
      addField('7. VISTOS ANTERIORES', 'Data de Emissão do Visto', formatDateForTXT(formData.visaIssueDate));
      addField('7. VISTOS ANTERIORES', 'Data de Vencimento do Visto', formatDateForTXT(formData.visaExpiryDate));
      addField('7. VISTOS ANTERIORES', 'Número do Visto', formData.visaNumber);
      addField('7. VISTOS ANTERIORES', 'Data da Última Chegada nos EUA', formatDateForTXT(formData.lastArrivalDate));
      addField('7. VISTOS ANTERIORES', 'Data da Última Saída dos EUA', formatDateForTXT(formData.lastDepartureDate));
      addField('7. VISTOS ANTERIORES', 'Data da Penúltima Chegada nos EUA', formatDateForTXT(formData.secondLastArrivalDate));
      addField('7. VISTOS ANTERIORES', 'Data da Penúltima Saída dos EUA', formatDateForTXT(formData.secondLastDepartureDate));
      addField('7. VISTOS ANTERIORES', 'Visto já foi negado ou cancelado', formData.visaDenied);
      if (formData.visaDenied === 'SIM') {
        addField('7. VISTOS ANTERIORES', 'Motivo da negativa ou cancelamento', formData.visaDeniedReason);
      }
    }

    // Section 8 - Informações Familiares
    addField('8. INFORMAÇÕES FAMILIARES', 'Sobrenome do Pai', formData.fatherLastName);
    addField('8. INFORMAÇÕES FAMILIARES', 'Nome do Pai', formData.fatherFirstName);
    addField('8. INFORMAÇÕES FAMILIARES', 'Data de Nascimento do Pai', formatDateForTXT(formData.fatherBirthDate));
    addField('8. INFORMAÇÕES FAMILIARES', 'Pai reside nos EUA', formData.fatherInUSA);
    if (formData.fatherInUSA === 'SIM') {
      addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Pai nos EUA', formData.fatherUSAAddress);
      addField('8. INFORMAÇÕES FAMILIARES', 'CEP do Pai nos EUA', cleanCEP(formData.fatherUSAZipCode));
      addField('8. INFORMAÇÕES FAMILIARES', 'Telefone do Pai nos EUA', cleanPhone(formData.fatherUSAPhone));
      addField('8. INFORMAÇÕES FAMILIARES', 'E-mail do Pai', emailToLower(formData.fatherUSAEmail));
    }
    addField('8. INFORMAÇÕES FAMILIARES', 'Sobrenome da Mãe', formData.motherLastName);
    addField('8. INFORMAÇÕES FAMILIARES', 'Nome da Mãe', formData.motherFirstName);
    addField('8. INFORMAÇÕES FAMILIARES', 'Data de Nascimento da Mãe', formatDateForTXT(formData.motherBirthDate));
    addField('8. INFORMAÇÕES FAMILIARES', 'Mãe reside nos EUA', formData.motherInUSA);
    if (formData.motherInUSA === 'SIM') {
      addField('8. INFORMAÇÕES FAMILIARES', 'Endereço da Mãe nos EUA', formData.motherUSAAddress);
      addField('8. INFORMAÇÕES FAMILIARES', 'CEP da Mãe nos EUA', cleanCEP(formData.motherUSAZipCode));
      addField('8. INFORMAÇÕES FAMILIARES', 'Telefone da Mãe nos EUA', cleanPhone(formData.motherUSAPhone));
      addField('8. INFORMAÇÕES FAMILIARES', 'E-mail da Mãe', emailToLower(formData.motherUSAEmail));
    }
    addField('8. INFORMAÇÕES FAMILIARES', 'Possui parentes nos EUA', formData.relativesInUSA);
    if (formData.relativesInUSA === 'SIM') {
      addField('8. INFORMAÇÕES FAMILIARES', 'Nome do Parente nos EUA', formData.relativeName);
      addField('8. INFORMAÇÕES FAMILIARES', 'Relação com o Parente', formData.relativeRelation);
      addField('8. INFORMAÇÕES FAMILIARES', 'Empresa do Parente', formData.relativeCompany);
      addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Parente', formData.relativeAddress);
      addField('8. INFORMAÇÕES FAMILIARES', 'Cidade do Parente', formData.relativeCity);
      addField('8. INFORMAÇÕES FAMILIARES', 'Estado do Parente', formData.relativeState);
      addField('8. INFORMAÇÕES FAMILIARES', 'CEP do Parente', cleanCEP(formData.relativeZipCode));
      addField('8. INFORMAÇÕES FAMILIARES', 'Telefone do Parente', cleanPhone(formData.relativePhone));
      addField('8. INFORMAÇÕES FAMILIARES', 'E-mail do Parente', emailToLower(formData.relativeEmail));
    }
    addField('8. INFORMAÇÕES FAMILIARES', 'Atualmente é casado(a)', formData.isCurrentlyMarried);
    if (formData.isCurrentlyMarried === 'SIM') {
      addField('8. INFORMAÇÕES FAMILIARES', 'Nome do Cônjuge', formData.spouseName);
      addField('8. INFORMAÇÕES FAMILIARES', 'Data de Nascimento do Cônjuge', formatDateForTXT(formData.spouseBirthDate));
      addField('8. INFORMAÇÕES FAMILIARES', 'Cidade/Estado de Nascimento do Cônjuge', formData.spouseBirthCityState);
      addField('8. INFORMAÇÕES FAMILIARES', 'Cônjuge reside no mesmo endereço', formData.spouseSameAddress);
      if (formData.spouseSameAddress === 'NAO') {
        addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Cônjuge - Rua', formData.spouseStreet);
        addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Cônjuge - Número', formData.spouseNumber);
        addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Cônjuge - Complemento', formData.spouseComplement);
        addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Cônjuge - Bairro', formData.spouseNeighborhood);
        addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Cônjuge - Cidade', formData.spouseCity);
        addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Cônjuge - Estado', formData.spouseState);
        addField('8. INFORMAÇÕES FAMILIARES', 'Endereço do Cônjuge - CEP', cleanCEP(formData.spouseZipCode));
      }
    }
    addField('8. INFORMAÇÕES FAMILIARES', 'Já foi casado(a) anteriormente', formData.wasMarried);
    if (formData.wasMarried === 'SIM') {
      addField('8. INFORMAÇÕES FAMILIARES', 'Nome do Ex-cônjuge', formData.exSpouseName);
      addField('8. INFORMAÇÕES FAMILIARES', 'Data de Nascimento do Ex-cônjuge', formatDateForTXT(formData.exSpouseBirthDate));
      addField('8. INFORMAÇÕES FAMILIARES', 'Cidade de Nascimento do Ex-cônjuge', formData.exSpouseBirthCity);
      addField('8. INFORMAÇÕES FAMILIARES', 'Estado de Nascimento do Ex-cônjuge', formData.exSpouseBirthState);
      addField('8. INFORMAÇÕES FAMILIARES', 'Data do Casamento', formatDateForTXT(formData.marriageDate));
      addField('8. INFORMAÇÕES FAMILIARES', 'Data do Divórcio', formatDateForTXT(formData.divorceDate));
      addField('8. INFORMAÇÕES FAMILIARES', 'País do Divórcio', formData.divorceCountry);
      addField('8. INFORMAÇÕES FAMILIARES', 'Motivo do Término do Casamento', formData.divorceReason);
    }

    // Section 9 - Ocupação Atual
    addField('9. OCUPAÇÃO ATUAL', 'Ocupação Atual', formData.jobTitle);
    addField('9. OCUPAÇÃO ATUAL', 'Nome da Empresa/Instituição', formData.companyName);
    const companyEnderecoCompleto = [formData.companyAddress, formData.companyNumber].filter(Boolean).join(', ');
    addField('9. OCUPAÇÃO ATUAL', 'Endereço da Empresa', companyEnderecoCompleto);
    addField('9. OCUPAÇÃO ATUAL', 'Cidade da Empresa', formData.companyCity);
    addField('9. OCUPAÇÃO ATUAL', 'Estado da Empresa', formData.companyState);
    addField('9. OCUPAÇÃO ATUAL', 'CEP da Empresa', cleanCEP(formData.companyZip));
    addField('9. OCUPAÇÃO ATUAL', 'Telefone da Empresa', cleanPhone(formData.companyPhone));
    addField('9. OCUPAÇÃO ATUAL', 'Data de Início na Empresa', formatDateForTXT(formData.companyStartDate));
    addField('9. OCUPAÇÃO ATUAL', 'Descrição das Funções', formData.jobDescription);
    addField('9. OCUPAÇÃO ATUAL', 'Remuneração Mensal', formData.companySalary);
    addField('9. OCUPAÇÃO ATUAL', 'Valor de Renda Adicional', formData.extraIncomeAmount);
    addField('9. OCUPAÇÃO ATUAL', 'Descrição da Renda Adicional', formData.extraIncomeDescription);

    // Section 10 - Ocupação Anterior
    addField('10. OCUPAÇÃO ANTERIOR', 'Teve ocupação anterior', formData.hasPrevJob);
    if (formData.hasPrevJob === 'SIM' && formData.prevJobsList.length > 0) {
      formData.prevJobsList.forEach((job, i) => {
        const prefix = formData.prevJobsList.length > 1 ? `Ocupação ${i + 1} - ` : '';
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Ocupação`, job.jobTitle);
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Nome da Empresa`, job.companyName);
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Endereço da Empresa`, job.companyAddress);
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Bairro da Empresa`, job.companyNeighborhood);
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Cidade da Empresa`, job.companyCity);
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Estado da Empresa`, job.companyState);
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}CEP da Empresa`, cleanCEP(job.companyZip));
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Telefone da Empresa`, cleanPhone(job.companyPhone));
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}País da Empresa`, job.companyCountry);
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Data de Início`, formatDateForTXT(job.startDate));
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Data de Término`, formatDateForTXT(job.endDate));
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Nome do Supervisor`, job.supervisorName);
        addField('10. OCUPAÇÃO ANTERIOR', `${prefix}Descrição das Funções`, job.jobDescription);
      });
    }

    // Section 11 - Universitário
    addField('11. UNIVERSITÁRIO', 'Frequentou escola ou universidade', formData.hasUniversity);
    if (formData.hasUniversity === 'SIM') {
      addField('11. UNIVERSITÁRIO', 'Nome da Instituição', formData.universityName);
      const universityEnderecoCompleto = [formData.universityAddress, formData.universityNumber].filter(Boolean).join(', ');
      addField('11. UNIVERSITÁRIO', 'Endereço da Instituição', universityEnderecoCompleto);
      addField('11. UNIVERSITÁRIO', 'Cidade da Instituição', formData.universityCity);
      addField('11. UNIVERSITÁRIO', 'Estado da Instituição', formData.universityState);
      addField('11. UNIVERSITÁRIO', 'CEP da Instituição', cleanCEP(formData.universityZip));
      addField('11. UNIVERSITÁRIO', 'Curso', formData.universityCourse);
      addField('11. UNIVERSITÁRIO', 'Data de Início', formatDateForTXT(formData.universityStartDate));
      addField('11. UNIVERSITÁRIO', 'Data de Conclusão', formatDateForTXT(formData.universityEndDate));
      if (formData.schoolsList.length > 0) {
        formData.schoolsList.forEach((school, i) => {
          const prefix = `Instituição ${i + 2} - `;
          addField('11. UNIVERSITÁRIO', `${prefix}Nome da Instituição`, school.name);
          addField('11. UNIVERSITÁRIO', `${prefix}Endereço da Instituição`, school.address);
          addField('11. UNIVERSITÁRIO', `${prefix}Cidade da Instituição`, school.city);
          addField('11. UNIVERSITÁRIO', `${prefix}Estado da Instituição`, school.state);
          addField('11. UNIVERSITÁRIO', `${prefix}CEP da Instituição`, cleanCEP(school.zip));
          addField('11. UNIVERSITÁRIO', `${prefix}Curso`, school.course);
          addField('11. UNIVERSITÁRIO', `${prefix}Data de Início`, formatDateForTXT(school.startDate));
          addField('11. UNIVERSITÁRIO', `${prefix}Data de Conclusão`, formatDateForTXT(school.endDate));
        });
      }
    }

    // Section 12 - Viagens Internacionais
    addField('12. VIAGENS INTERNACIONAIS', 'Viajou nos últimos 5 anos', formData.traveledLast5Years);
    addField('12. VIAGENS INTERNACIONAIS', 'Países Visitados', formData.traveledCountry1);
    addField('12. VIAGENS INTERNACIONAIS', 'Idiomas que fala', formData.spokenLanguages);

    // Section 13 - Dados do I-20
    addField('13. DADOS DO I20', 'Possui formulário I-20', formData.hasI20);
    if (formData.hasI20 === 'SIM') {
      addField('13. DADOS DO I20', 'Número do I-20', formData.i20Number);
      addField('13. DADOS DO I20', 'Nome da Escola', formData.i20SchoolName);
      addField('13. DADOS DO I20', 'Curso', formData.i20Course);
      addField('13. DADOS DO I20', 'Período do Curso', formData.i20CoursePeriod);
      addField('13. DADOS DO I20', 'Telefone da Escola', cleanPhone(formData.i20SchoolPhone));
      addField('13. DADOS DO I20', 'E-mail da Escola', emailToLower(formData.i20SchoolEmail));
    }

    // Montar TXT final
    const nomeCompleto = `${formData.firstName} ${formData.lastName}`.trim();
    let txt = `FORMULÁRIO DS-160 - VISTO AMERICANO\n`;
    txt += `${nomeCompleto}\n`;
    txt += `Data de Geração: ${getBrazilDateTimeString()}\n`;

    Object.entries(sections).forEach(([section, items]) => {
      if (items.length > 0) {
        txt += `====== ${section} ======\n`;
        items.forEach(item => {
          txt += `${item}\n`;
        });
        txt += '\n';
      }
    });

    // Download - salva com nome do usuário
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nomeArquivo = `${nomeCompleto}`.replace(/\s+/g, '_').toLowerCase();
    a.download = `DS160_${nomeArquivo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Arquivo TXT gerado com sucesso!');
  };

  if (loading || loadingForm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#623AA2] mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Tela de Revisão antes do envio
  if (showReview) {
    const fmt = (dateString: string) => {
      if (!dateString) return '-';
      const parts = dateString.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateString;
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/logo-ihsvistos.png" alt="IHS Vistos" className="w-12 h-12 rounded-full shadow-lg object-cover" />
                <div>
                   <h1 className="text-xl font-bold text-[#623AA2]">IHS Vistos</h1>
                  <p className="text-sm text-gray-500">Revise seus dados antes de enviar</p>
                </div>
              </div>
            </div>
          </div>

          <Alert className="mb-6 border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Atenção:</strong> Confira todos os dados abaixo antes de enviar o formulário. Se houver algum erro, clique em &quot;Voltar e Corrigir&quot;.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[#623AA2] flex items-center gap-2">
                <User className="h-5 w-5" />
                1. Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-gray-500">Nome Completo:</span><br />{formData.firstName} {formData.lastName}</div>
                {formData.usedOtherName === 'SIM' && <div><span className="font-medium text-gray-500">Nome Anterior:</span><br />{formData.oldFirstName} {formData.oldLastName}</div>}
                <div><span className="font-medium text-gray-500">Data de Nascimento:</span><br />{fmt(formData.birthDate)}</div>
                <div><span className="font-medium text-gray-500">Cidade/Estado de Nascimento:</span><br />{formData.birthCity || '-'}</div>
                <div><span className="font-medium text-gray-500">País:</span><br />{formData.birthCountry || '-'}</div>
                <div><span className="font-medium text-gray-500">Estado Civil:</span><br />{formData.maritalStatus || '-'}</div>
                <div><span className="font-medium text-gray-500">CPF:</span><br />{formData.cpf || '-'}</div>
                <div><span className="font-medium text-gray-500">RG:</span><br />{formData.rg || '-'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[#623AA2] flex items-center gap-2">
                <Phone className="h-5 w-5" />
                2. Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-2"><span className="font-medium text-gray-500">Endereço:</span><br />{formData.address || '-'}</div>
                <div><span className="font-medium text-gray-500">Bairro:</span><br />{formData.neighborhood || '-'}</div>
                <div><span className="font-medium text-gray-500">Cidade:</span><br />{formData.city || '-'}</div>
                <div><span className="font-medium text-gray-500">Estado:</span><br />{formData.contactState || '-'}</div>
                <div><span className="font-medium text-gray-500">CEP:</span><br />{formData.zipCode || '-'}</div>
                <div><span className="font-medium text-gray-500">Telefone:</span><br />{formData.phone1 || '-'}</div>
                <div><span className="font-medium text-gray-500">E-mail:</span><br />{formData.email || '-'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[#623AA2] flex items-center gap-2">
                <Globe className="h-5 w-5" />
                3. Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div><span className="font-medium text-gray-500">Possui redes sociais:</span><br />{formData.hasSocialMedia === 'SIM' ? 'Sim' : formData.hasSocialMedia === 'NAO' ? 'Não' : '-'}</div>
                {formData.hasSocialMedia === 'SIM' && formData.socialList.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.socialList.map((s, i) => (
                      <div key={i}><span className="font-medium text-gray-500">{s.platform}:</span> {s.username}</div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[#623AA2] flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                4. Passaporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-gray-500">Série/Número:</span><br />{formData.passportSeries || '-'}/{formData.passportNumber || '-'}</div>
                <div><span className="font-medium text-gray-500">Data de Emissão:</span><br />{fmt(formData.passportIssueDate)}</div>
                <div><span className="font-medium text-gray-500">Data de Expiração:</span><br />{fmt(formData.passportExpiryDate)}</div>
                <div><span className="font-medium text-gray-500">Cidade/Estado de Emissão:</span><br />{formData.passportIssueCity || '-'} / {formData.passportIssueState || '-'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[#623AA2] flex items-center gap-2">
                <Plane className="h-5 w-5" />
                5. Viagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-gray-500">Motivo:</span><br />{formData.travelReason || '-'}</div>
                {formData.knowsArrivalDate === 'SIM' && <div><span className="font-medium text-gray-500">Data de Chegada:</span><br />{fmt(formData.arrivalDate)}</div>}
                {formData.stayDuration && <div><span className="font-medium text-gray-500">Permanência:</span><br />{formData.stayDuration}</div>}
                {formData.travelSponsor && <div><span className="font-medium text-gray-500">Patrocinador:</span><br />{formData.travelSponsor}</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[#623AA2] flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                6. Ocupação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-gray-500">Ocupação:</span><br />{formData.jobTitle || '-'}</div>
                <div><span className="font-medium text-gray-500">Empresa:</span><br />{formData.companyName || '-'}</div>
                <div><span className="font-medium text-gray-500">Endereço da Empresa:</span><br />{formData.companyAddress || '-'}</div>
                <div><span className="font-medium text-gray-500">Cidade/Estado:</span><br />{formData.companyCity || '-'} / {formData.companyState || '-'}</div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 bg-white py-4 border-t flex flex-col sm:flex-row gap-3 justify-end shadow-lg rounded-lg px-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReview(false)}
              className="w-full sm:w-auto h-12"
              disabled={submitting}
            >
              Voltar e Corrigir
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSubmit}
              className="bg-[#009639] hover:bg-[#007a2e] w-full sm:w-auto h-12 text-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Confirmar e Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#623AA2] to-[#F97794] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#623AA2] mb-2">Formulário Enviado!</h2>
            <p className="text-gray-600 mb-6">
              Seus dados foram enviados com sucesso. Nossa equipe entrará em contato em breve.
            </p>
            <Button onClick={handleSignOut} className="w-full bg-[#009639] hover:bg-[#007a2e]">
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#623AA2] to-[#F97794] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#623AA2] mb-2">Acesso Encerrado</h2>
            <p className="text-gray-600 mb-6">
              Seu processo já foi finalizado. Entre em contato com nossa equipe para mais informações.
            </p>
            <Button onClick={handleSignOut} className="w-full bg-[#009639] hover:bg-[#007a2e]">
              Sair
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
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo-ihsvistos.png" alt="IHS Vistos" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-lg object-cover" />
              <div>
                <h1 className="font-bold text-[#623AA2] text-sm sm:text-base">IHS Vistos - Formulário DS160</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Visto Americano</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={saveDraft}
                disabled={saving}
                className="h-9 sm:h-8 bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:mr-1" />
                ) : (
                  <Save className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">{saving ? 'Salvando...' : 'Salvar Informações'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="h-9 sm:h-8"
              >
                <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
        {/* Alerta importante sobre salvar */}
        <Alert className="mb-4 border-blue-300 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-blue-800 text-xs sm:text-sm">
            <strong>⚠️ Importante:</strong> Clique no botão <strong>&quot;Salvar Informações&quot;</strong> acima para guardar seus dados. 
            Faça isso sempre que preencher novas informações. Seus dados ficarão salvos mesmo se você sair da página.
            {lastSaved && (
              <span className="block mt-1 text-green-700">
                ✓ Último salvamento: {lastSaved.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </AlertDescription>
        </Alert>

        <Alert className="mb-4 sm:mb-6 border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <AlertDescription className="text-yellow-800 text-xs sm:text-sm">
            <strong>Atenção:</strong> Este não é um formulário oficial do governo dos EUA. 
            Os dados serão usados para auxiliar no processo de solicitação do visto.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="border-red-300 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <AlertDescription className="text-red-800">
                <strong>Formulário incompleto ({validationErrors.length} {validationErrors.length === 1 ? 'campo pendente' : 'campos pendentes'}):</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Section 0 - Application Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <MapPin className="h-5 w-5" />
                0. Local de Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Local de Solicitação do Visto *</Label>
                <Select
                  value={formData.applicationLocation}
                  onValueChange={(value) => handleSelectChange('applicationLocation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o consulado" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_LOCATIONS.map(loc => (
                      <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 1 - Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <User className="h-5 w-5" />
                1. Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sobrenome (como no passaporte) *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome (como no passaporte) *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                   
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Já utilizou outro nome?</Label>
                <Select
                  value={formData.usedOtherName}
                  onValueChange={(value) => handleSelectChange('usedOtherName', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.usedOtherName === 'SIM' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label>Antigo Sobrenome</Label>
                    <Input
                      value={formData.oldLastName}
                      onChange={(e) => handleInputChange('oldLastName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Antigo Nome</Label>
                    <Input
                      value={formData.oldFirstName}
                      onChange={(e) => handleInputChange('oldFirstName', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Nascimento *</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade/Estado de Nascimento *</Label>
                  <Input
                    value={formData.birthCity}
                    onChange={(e) => handleInputChange('birthCity', e.target.value)}
                    placeholder="Ex: SAO PAULO/SP"
                   
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>País de Nascimento</Label>
                  <Input value={formData.birthCountry} readOnly className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Estado Civil *</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => handleSelectChange('maritalStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOLTEIRO(A)">SOLTEIRO(A)</SelectItem>
                      <SelectItem value="CASADO(A)">CASADO(A)</SelectItem>
                      <SelectItem value="UNIAO ESTAVEL">UNIÃO ESTÁVEL</SelectItem>
                      <SelectItem value="DIVORCIADO(A)">DIVORCIADO(A)</SelectItem>
                      <SelectItem value="VIUVO(A)">VIÚVO(A)</SelectItem>
                      <SelectItem value="SEPARADO(A)">SEPARADO(A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CPF *</Label>
                  <Input value={formData.cpf} readOnly className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input
                    value={formData.rg}
                    onChange={(e) => handleInputChange('rg', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 - Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <Phone className="h-5 w-5" />
                2. Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CEP *</Label>
                <Input
                  value={formData.zipCode}
                  onChange={(e) => handleCEPChange('zipCode', e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>

              <div className="space-y-2">
                <Label>Endereço *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Número *</Label>
                  <Input
                    value={formData.addressNumber}
                    onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                    
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={formData.addressComplement}
                    onChange={(e) => handleInputChange('addressComplement', e.target.value)}
                    
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bairro *</Label>
                  <Input
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Input
                    value={formData.contactState}
                    onChange={(e) => handleInputChange('contactState', e.target.value)}
                    
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone Principal *</Label>
                  <Input
                    value={formData.phone1}
                    onChange={(e) => handleInputChange('phone1', e.target.value)}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone Opcional</Label>
                  <Input
                    value={formData.phone2}
                    onChange={(e) => handleInputChange('phone2', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone Profissional</Label>
                  <Input
                    value={formData.phoneProfessional}
                    onChange={(e) => handleInputChange('phoneProfessional', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange('email', e.target.value)}
                   
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Usou outros telefones nos últimos 5 anos?</Label>
                <Select
                  value={formData.usedOtherPhones}
                  onValueChange={(value) => handleSelectChange('usedOtherPhones', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.usedOtherPhones === 'SIM' && (
                <div className="space-y-2">
                  <Label>Telefones anteriores</Label>
                  <Textarea
                    value={formData.otherPhones}
                    onChange={(e) => handleInputChange('otherPhones', e.target.value)}
                    placeholder="Ex: (11) 99999-9999, (11) 88888-8888"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Usou outros e-mails nos últimos 5 anos?</Label>
                <Select
                  value={formData.usedOtherEmails}
                  onValueChange={(value) => handleSelectChange('usedOtherEmails', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.usedOtherEmails === 'SIM' && (
                <div className="space-y-2">
                  <Label>E-mails anteriores</Label>
                  <Textarea
                    value={formData.otherEmails}
                    onChange={(e) => handleInputChange('otherEmails', e.target.value)}
                    placeholder="Ex: email1@exemplo.com, email2@exemplo.com"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3 - Correspondence Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <MapPin className="h-5 w-5" />
                3. Endereço de Correspondência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>O endereço de correspondência é o mesmo da residência? *</Label>
                <Select
                  value={formData.sameAddress}
                  onValueChange={(value) => handleSelectChange('sameAddress', value)}
                 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione SIM ou NÃO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIM">SIM</SelectItem>
                    <SelectItem value="NAO">NÃO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.sameAddress === 'NAO' && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rua *</Label>
                      <Input
                        value={formData.corrStreet}
                        onChange={(e) => handleInputChange('corrStreet', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número *</Label>
                        <Input
                          value={formData.corrNumber}
                          onChange={(e) => handleInputChange('corrNumber', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        <Input
                          value={formData.corrComplement}
                          onChange={(e) => handleInputChange('corrComplement', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Cidade *</Label>
                      <Input
                        value={formData.corrCity}
                        onChange={(e) => handleInputChange('corrCity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado *</Label>
                      <Input
                        value={formData.corrState}
                        onChange={(e) => handleInputChange('corrState', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CEP *</Label>
                      <Input
                        value={formData.corrZipCode}
                        onChange={(e) => handleInputChange('corrZipCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4 - Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <Globe className="h-5 w-5" />
                4. Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Possui redes sociais? *</Label>
                <Select
                  value={formData.hasSocialMedia}
                  onValueChange={(value) => handleSelectChange('hasSocialMedia', value)}
                 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione SIM ou NÃO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.hasSocialMedia === 'SIM' && (
                <div className="space-y-4">
                  <Button type="button" variant="outline" size="sm" onClick={addSocialMedia}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Rede Social
                  </Button>

                  {formData.socialList.map((social, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Select
                          value={social.platform}
                          onValueChange={(value) => updateSocialMedia(index, 'platform', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Plataforma" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOCIAL_PLATFORMS.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Nome de usuário ou link"
                          value={social.username}
                          onChange={(e) => updateSocialMedia(index, 'username', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialMedia(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5 - Passport */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <CreditCard className="h-5 w-5" />
                5. Passaporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Série (2 letras) *</Label>
                  <Input
                    value={formData.passportSeries}
                    onChange={(e) => handleInputChange('passportSeries', e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))}
                    maxLength={2}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número *</Label>
                  <Input
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                   
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Emissão *</Label>
                  <Input
                    type="date"
                    value={formData.passportIssueDate}
                    onChange={(e) => handleInputChange('passportIssueDate', e.target.value)}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Expiração *</Label>
                  <Input
                    type="date"
                    value={formData.passportExpiryDate}
                    onChange={(e) => handleInputChange('passportExpiryDate', e.target.value)}
                   
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade de Emissão *</Label>
                  <Input
                    value={formData.passportIssueCity}
                    onChange={(e) => handleInputChange('passportIssueCity', e.target.value)}
                    placeholder="Ex: SAO PAULO"
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado de Emissão *</Label>
                  <Input
                    value={formData.passportIssueState}
                    onChange={(e) => handleInputChange('passportIssueState', e.target.value)}
                    placeholder="Ex: SP"
                    maxLength={2}
                   
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 - Travel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <Plane className="h-5 w-5" />
                6. Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Motivo da viagem *</Label>
                  <Input
                    value={formData.travelReason}
                    onChange={(e) => handleInputChange('travelReason', e.target.value)}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Possui planos específicos? *</Label>
                  <Select
                    value={formData.hasTravelPlans}
                    onValueChange={(value) => handleSelectChange('hasTravelPlans', value)}
                   
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione SIM ou NÃO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NÃO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sabe a data de chegada? *</Label>
                  <Select
                    value={formData.knowsArrivalDate}
                    onValueChange={(value) => handleSelectChange('knowsArrivalDate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione SIM ou NÃO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NÃO (Não sei ainda)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.knowsArrivalDate === 'SIM' && (
                  <div className="space-y-2">
                    <Label>Data de chegada pretendida *</Label>
                    <Input
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempo de permanência</Label>
                  <Input
                    value={formData.stayDuration}
                    onChange={(e) => handleInputChange('stayDuration', e.target.value)}
                    placeholder="Ex: 15 DIAS"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Onde deseja visitar</Label>
                <Textarea
                  value={formData.placesToVisit}
                  onChange={(e) => handleInputChange('placesToVisit', e.target.value)}
                  placeholder="Ex: NOVA YORK, ORLANDO, MIAMI..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.travelCity}
                    onChange={(e) => handleInputChange('travelCity', e.target.value)}
                    placeholder="Ex: NOVA YORK"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado (EUA)</Label>
                  <Input
                    value={formData.travelState}
                    onChange={(e) => handleInputChange('travelState', e.target.value)}
                    placeholder="Ex: NY"
                  />
                </div>
              </div>

              {/* Sponsor */}
              <div className="space-y-2">
                <Label>Quem irá patrocinar sua viagem?</Label>
                <Select
                  value={formData.travelSponsor}
                  onValueChange={(value) => handleSelectChange('travelSponsor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="OUTROS">OUTROS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.travelSponsor === 'OUTROS' && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Patrocinador *</Label>
                      <Input
                        value={formData.sponsorName}
                        onChange={(e) => handleInputChange('sponsorName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone *</Label>
                      <Input
                        value={formData.sponsorPhone}
                        onChange={(e) => handleInputChange('sponsorPhone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>E-mail do Patrocinador *</Label>
                      <Input
                        type="email"
                        value={formData.sponsorEmail}
                        onChange={(e) => handleEmailChange('sponsorEmail', e.target.value)}
                        placeholder="exemplo@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relação com você *</Label>
                      <Input
                        value={formData.sponsorRelation}
                        onChange={(e) => handleInputChange('sponsorRelation', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cidade *</Label>
                      <Input
                        value={formData.sponsorCity}
                        onChange={(e) => handleInputChange('sponsorCity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado *</Label>
                      <Input
                        value={formData.sponsorState}
                        onChange={(e) => handleInputChange('sponsorState', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CEP *</Label>
                      <Input
                        value={formData.sponsorZipCode}
                        onChange={(e) => handleInputChange('sponsorZipCode', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>País *</Label>
                      <Input
                        value={formData.sponsorCountry}
                        onChange={(e) => handleInputChange('sponsorCountry', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* US Address */}
              <div className="pt-4 border-t">
                <div className="space-y-2 mb-4">
                  <Label>Sabe o endereço onde ficará nos EUA? *</Label>
                  <Select
                    value={formData.knowsUSAddress}
                    onValueChange={(value) => handleSelectChange('knowsUSAddress', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione SIM ou NÃO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NÃO (Não sei ainda)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.knowsUSAddress === 'SIM' && (
                  <>
                    <h4 className="font-medium text-gray-700 mb-4">Endereço nos EUA (Hotel)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rua</Label>
                        <Input
                          value={formData.usStreet}
                          onChange={(e) => handleInputChange('usStreet', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Número</Label>
                          <Input
                            value={formData.usNumber}
                            onChange={(e) => handleInputChange('usNumber', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Complemento</Label>
                          <Input
                            value={formData.usComplement}
                            onChange={(e) => handleInputChange('usComplement', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input
                          value={formData.usCity}
                          onChange={(e) => handleInputChange('usCity', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Input
                          value={formData.usState}
                          onChange={(e) => handleInputChange('usState', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zip Code</Label>
                        <Input
                          value={formData.usZipCode}
                          onChange={(e) => handleInputChange('usZipCode', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Travel Companions */}
              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <Label>Existem pessoas que irão com você? *</Label>
                  <Select
                    value={formData.travelCompanions}
                    onValueChange={(value) => handleSelectChange('travelCompanions', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NAO">NÃO</SelectItem>
                      <SelectItem value="SIM">SIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.travelCompanions === 'SIM' && (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>É grupo ou organização? *</Label>
                      <Select
                        value={formData.isGroup}
                        onValueChange={(value) => handleSelectChange('isGroup', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SIM">SIM</SelectItem>
                          <SelectItem value="NAO">NÃO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.isGroup === 'SIM' ? (
                      <div className="space-y-2">
                        <Label>Nome do Grupo</Label>
                        <Input
                          value={formData.groupName}
                          onChange={(e) => handleInputChange('groupName', e.target.value)}
                        />
                      </div>
                    ) : formData.isGroup === 'NAO' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700">Companheiros de viagem</h4>
                          <Button type="button" variant="outline" size="sm" onClick={addCompanion}>
                            <Plus className="h-4 w-4 mr-1" /> Adicionar
                          </Button>
                        </div>
                        {formData.companionsList.map((companion, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">Companheiro {index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCompanion(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Sobrenome da pessoa</Label>
                                <Input
                                  value={companion.lastName}
                                  onChange={(e) => updateCompanion(index, 'lastName', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Nome da pessoa</Label>
                                <Input
                                  value={companion.firstName}
                                  onChange={(e) => updateCompanion(index, 'firstName', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Grau de parentesco</Label>
                                <Input
                                  value={companion.relationship}
                                  onChange={(e) => updateCompanion(index, 'relationship', e.target.value)}
                                  placeholder="Ex: ESPOSA, FILHO, IRMAO"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 7 - Previous Visas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <FileText className="h-5 w-5" />
                7. Vistos Anteriores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Já teve visto para os EUA? *</Label>
                <Select
                  value={formData.usTravelHistory}
                  onValueChange={(value) => handleSelectChange('usTravelHistory', value)}
                 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione SIM ou NÃO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.usTravelHistory === 'SIM' && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Emissão</Label>
                      <Input
                        type="date"
                        value={formData.visaIssueDate}
                        onChange={(e) => handleInputChange('visaIssueDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Vencimento</Label>
                      <Input
                        type="date"
                        value={formData.visaExpiryDate}
                        onChange={(e) => handleInputChange('visaExpiryDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Número do Visto</Label>
                      <Input
                        value={formData.visaNumber}
                        onChange={(e) => handleInputChange('visaNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-700">Última vez nos EUA</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de chegada</Label>
                      <Input
                        type="date"
                        value={formData.lastArrivalDate}
                        onChange={(e) => handleInputChange('lastArrivalDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de saída</Label>
                      <Input
                        type="date"
                        value={formData.lastDepartureDate}
                        onChange={(e) => handleInputChange('lastDepartureDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-700">Penúltima vez nos EUA</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de chegada</Label>
                      <Input
                        type="date"
                        value={formData.secondLastArrivalDate}
                        onChange={(e) => handleInputChange('secondLastArrivalDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de saída</Label>
                      <Input
                        type="date"
                        value={formData.secondLastDepartureDate}
                        onChange={(e) => handleInputChange('secondLastDepartureDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Já teve visto negado ou cancelado?</Label>
                    <Select
                      value={formData.visaDenied}
                      onValueChange={(value) => handleSelectChange('visaDenied', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NAO">NÃO</SelectItem>
                        <SelectItem value="SIM">SIM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.visaDenied === 'SIM' && (
                    <div className="space-y-2">
                      <Label>Motivo</Label>
                      <Textarea
                        value={formData.visaDeniedReason}
                        onChange={(e) => handleInputChange('visaDeniedReason', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 8 - Family Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <Users className="h-5 w-5" />
                8. Informações Familiares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parents */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Pai</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sobrenome do pai *</Label>
                    <Input
                      value={formData.fatherLastName}
                      onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do pai *</Label>
                    <Input
                      value={formData.fatherFirstName}
                      onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de nascimento *</Label>
                    <Input
                      type="date"
                      value={formData.fatherBirthDate}
                      onChange={(e) => handleInputChange('fatherBirthDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Está nos EUA? *</Label>
                  <Select
                    value={formData.fatherInUSA}
                    onValueChange={(value) => handleSelectChange('fatherInUSA', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NAO">NÃO</SelectItem>
                      <SelectItem value="SIM">SIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.fatherInUSA === 'SIM' && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <h5 className="font-medium text-gray-600 text-sm">Endereço do Pai nos EUA</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Endereço nos EUA *</Label>
                        <Input
                          value={formData.fatherUSAAddress}
                          onChange={(e) => handleInputChange('fatherUSAAddress', e.target.value)}
                          placeholder="Street, City, State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zip Code *</Label>
                        <Input
                          value={formData.fatherUSAZipCode}
                          onChange={(e) => handleInputChange('fatherUSAZipCode', e.target.value)}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Telefone nos EUA *</Label>
                        <Input
                          value={formData.fatherUSAPhone}
                          onChange={(e) => handleInputChange('fatherUSAPhone', e.target.value)}
                          placeholder="+1 (XXX) XXX-XXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail *</Label>
                        <Input
                          type="email"
                          value={formData.fatherUSAEmail}
                          onChange={(e) => handleEmailChange('fatherUSAEmail', e.target.value)}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-gray-700">Mãe</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sobrenome da mãe *</Label>
                    <Input
                      value={formData.motherLastName}
                      onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome da mãe *</Label>
                    <Input
                      value={formData.motherFirstName}
                      onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de nascimento *</Label>
                    <Input
                      type="date"
                      value={formData.motherBirthDate}
                      onChange={(e) => handleInputChange('motherBirthDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Está nos EUA? *</Label>
                  <Select
                    value={formData.motherInUSA}
                    onValueChange={(value) => handleSelectChange('motherInUSA', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NAO">NÃO</SelectItem>
                      <SelectItem value="SIM">SIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.motherInUSA === 'SIM' && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <h5 className="font-medium text-gray-600 text-sm">Endereço da Mãe nos EUA</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Endereço nos EUA *</Label>
                        <Input
                          value={formData.motherUSAAddress}
                          onChange={(e) => handleInputChange('motherUSAAddress', e.target.value)}
                          placeholder="Street, City, State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zip Code *</Label>
                        <Input
                          value={formData.motherUSAZipCode}
                          onChange={(e) => handleInputChange('motherUSAZipCode', e.target.value)}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Telefone nos EUA *</Label>
                        <Input
                          value={formData.motherUSAPhone}
                          onChange={(e) => handleInputChange('motherUSAPhone', e.target.value)}
                          placeholder="+1 (XXX) XXX-XXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail *</Label>
                        <Input
                          type="email"
                          value={formData.motherUSAEmail}
                          onChange={(e) => handleEmailChange('motherUSAEmail', e.target.value)}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Relatives in USA */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Possui parentes nos EUA? *</Label>
                  <Select
                    value={formData.relativesInUSA}
                    onValueChange={(value) => handleSelectChange('relativesInUSA', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione SIM ou NÃO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NAO">NÃO</SelectItem>
                      <SelectItem value="SIM">SIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.relativesInUSA === 'SIM' && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome completo *</Label>
                        <Input
                          value={formData.relativeName}
                          onChange={(e) => handleInputChange('relativeName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Relação *</Label>
                        <Input
                          value={formData.relativeRelation}
                          onChange={(e) => handleInputChange('relativeRelation', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>E-mail do parente *</Label>
                        <Input
                          type="email"
                          value={formData.relativeEmail}
                          onChange={(e) => handleEmailChange('relativeEmail', e.target.value)}
                          placeholder="exemplo@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={formData.relativePhone}
                          onChange={(e) => handleInputChange('relativePhone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Empresa</Label>
                        <Input
                          value={formData.relativeCompany}
                          onChange={(e) => handleInputChange('relativeCompany', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Endereço</Label>
                        <Input
                          value={formData.relativeAddress}
                          onChange={(e) => handleInputChange('relativeAddress', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input
                          value={formData.relativeCity}
                          onChange={(e) => handleInputChange('relativeCity', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Input
                          value={formData.relativeState}
                          onChange={(e) => handleInputChange('relativeState', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zip Code</Label>
                        <Input
                          value={formData.relativeZipCode}
                          onChange={(e) => handleInputChange('relativeZipCode', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* É casado atualmente? */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>É casado(a) atualmente? *</Label>
                  <Select
                    value={formData.isCurrentlyMarried}
                    onValueChange={(value) => handleSelectChange('isCurrentlyMarried', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione SIM ou NÃO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NAO">NÃO</SelectItem>
                      <SelectItem value="SIM">SIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.isCurrentlyMarried === 'SIM' && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <h4 className="font-medium text-gray-700">Cônjuge</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Nome completo do cônjuge</Label>
                        <Input
                          value={formData.spouseName}
                          onChange={(e) => handleInputChange('spouseName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de nascimento</Label>
                        <Input
                          type="date"
                          value={formData.spouseBirthDate}
                          onChange={(e) => handleInputChange('spouseBirthDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cidade/Estado de nascimento</Label>
                        <Input
                          value={formData.spouseBirthCityState}
                          onChange={(e) => handleInputChange('spouseBirthCityState', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reside no mesmo endereço?</Label>
                        <Select
                          value={formData.spouseSameAddress}
                          onValueChange={(value) => handleSelectChange('spouseSameAddress', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SIM">SIM</SelectItem>
                            <SelectItem value="NAO">NÃO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.spouseSameAddress === 'NAO' && (
                      <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="font-medium text-gray-700">Endereço do Cônjuge</h4>
                        <div className="space-y-2">
                          <Label>Rua</Label>
                          <Input
                            value={formData.spouseStreet}
                            onChange={(e) => handleInputChange('spouseStreet', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Número</Label>
                            <Input
                              value={formData.spouseNumber}
                              onChange={(e) => handleInputChange('spouseNumber', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Complemento</Label>
                            <Input
                              value={formData.spouseComplement}
                              onChange={(e) => handleInputChange('spouseComplement', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Bairro</Label>
                            <Input
                              value={formData.spouseNeighborhood}
                              onChange={(e) => handleInputChange('spouseNeighborhood', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Cidade</Label>
                            <Input
                              value={formData.spouseCity}
                              onChange={(e) => handleInputChange('spouseCity', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Estado</Label>
                            <Input
                              value={formData.spouseState}
                              onChange={(e) => handleInputChange('spouseState', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CEP</Label>
                            <Input
                              value={formData.spouseZipCode}
                              onChange={(e) => handleInputChange('spouseZipCode', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Já foi casado */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Já foi casado(a) anteriormente? *</Label>
                  <Select
                    value={formData.wasMarried}
                    onValueChange={(value) => handleSelectChange('wasMarried', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione SIM ou NÃO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NAO">NÃO</SelectItem>
                      <SelectItem value="SIM">SIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.wasMarried === 'SIM' && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do ex-cônjuge *</Label>
                        <Input
                          value={formData.exSpouseName}
                          onChange={(e) => handleInputChange('exSpouseName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de nascimento *</Label>
                        <Input
                          type="date"
                          value={formData.exSpouseBirthDate}
                          onChange={(e) => handleInputChange('exSpouseBirthDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cidade de Nascimento *</Label>
                        <Input
                          value={formData.exSpouseBirthCity}
                          onChange={(e) => handleInputChange('exSpouseBirthCity', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado de Nascimento *</Label>
                        <Input
                          value={formData.exSpouseBirthState}
                          onChange={(e) => handleInputChange('exSpouseBirthState', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data do casamento *</Label>
                        <Input
                          type="date"
                          value={formData.marriageDate}
                          onChange={(e) => handleInputChange('marriageDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data do divórcio *</Label>
                        <Input
                          type="date"
                          value={formData.divorceDate}
                          onChange={(e) => handleInputChange('divorceDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>País do divórcio *</Label>
                        <Input
                          value={formData.divorceCountry}
                          onChange={(e) => handleInputChange('divorceCountry', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Motivo do divórcio *</Label>
                        <Textarea
                          value={formData.divorceReason}
                          onChange={(e) => handleInputChange('divorceReason', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 9 - Current Occupation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <Briefcase className="h-5 w-5" />
                9. Ocupação Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ocupação *</Label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome da Empresa/Escola *</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                   
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CEP *</Label>
                  <Input
                    value={formData.companyZip}
                    onChange={(e) => handleCompanyCEPChange(e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.companyCity}
                    onChange={(e) => handleInputChange('companyCity', e.target.value)}
                    
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Input
                    value={formData.companyState}
                    onChange={(e) => handleInputChange('companyState', e.target.value)}
                    
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Endereço *</Label>
                <Input
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número *</Label>
                  <Input
                    value={formData.companyNumber}
                    onChange={(e) => handleInputChange('companyNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de início *</Label>
                  <Input
                    type="date"
                    value={formData.companyStartDate}
                    onChange={(e) => handleInputChange('companyStartDate', e.target.value)}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>Remuneração (R$) {formData.jobTitle && formData.jobTitle.toUpperCase().includes('ESTUDANTE') ? '' : '*'}</Label>
                  <Input
                    value={formData.companySalary}
                    onChange={(e) => handleSalaryChange('companySalary', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição das Funções *</Label>
                <Textarea
                  value={formData.jobDescription}
                  onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                  placeholder={formData.jobTitle && formData.jobTitle.toUpperCase().includes('ESTUDANTE') ? 'Descreva o curso que está cursando, turno e período (ex: Ciência da Computação, 3° período, turno integral)' : 'Descreva suas principais funções e responsabilidades'}
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ganho extra (R$)</Label>
                  <Input
                    value={formData.extraIncomeAmount}
                    onChange={(e) => handleSalaryChange('extraIncomeAmount', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição do ganho extra</Label>
                  <Input
                    value={formData.extraIncomeDescription}
                    onChange={(e) => handleInputChange('extraIncomeDescription', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 10 - Previous Occupation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <Briefcase className="h-5 w-5" />
                10. Ocupação Anterior (últimos 5 anos)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Teve ocupação anterior nos últimos 5 anos? *</Label>
                <Select
                  value={formData.hasPrevJob}
                  onValueChange={(value) => handleSelectChange('hasPrevJob', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.hasPrevJob === 'SIM' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Ocupações Anteriores</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addPrevJob}>
                      <Plus className="h-4 w-4 mr-1" /> Adicionar Ocupação
                    </Button>
                  </div>

                  {formData.prevJobsList.length === 0 && (
                    <p className="text-sm text-gray-500">Clique em &quot;Adicionar Ocupação&quot; para incluir uma ocupação anterior.</p>
                  )}

                  {formData.prevJobsList.map((job, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Ocupação Anterior {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrevJob(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Ocupação *</Label>
                          <Input
                            value={job.jobTitle}
                            onChange={(e) => updatePrevJob(index, 'jobTitle', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nome da Empresa *</Label>
                          <Input
                            value={job.companyName}
                            onChange={(e) => updatePrevJob(index, 'companyName', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>CEP *</Label>
                          <Input
                            value={job.companyZip}
                            onChange={(e) => handlePrevJobCEPChange(index, e.target.value)}
                            placeholder="00000-000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cidade *</Label>
                          <Input
                            value={job.companyCity}
                            onChange={(e) => updatePrevJob(index, 'companyCity', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Estado *</Label>
                          <Input
                            value={job.companyState}
                            onChange={(e) => updatePrevJob(index, 'companyState', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Endereço *</Label>
                        <Input
                          value={job.companyAddress}
                          onChange={(e) => updatePrevJob(index, 'companyAddress', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Bairro</Label>
                          <Input
                            value={job.companyNeighborhood}
                            onChange={(e) => updatePrevJob(index, 'companyNeighborhood', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input
                            value={job.companyPhone}
                            onChange={(e) => updatePrevJob(index, 'companyPhone', e.target.value)}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>País</Label>
                          <Input
                            value={job.companyCountry}
                            onChange={(e) => updatePrevJob(index, 'companyCountry', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data de Início *</Label>
                          <Input
                            type="date"
                            value={job.startDate}
                            onChange={(e) => updatePrevJob(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Data de Término *</Label>
                          <Input
                            type="date"
                            value={job.endDate}
                            onChange={(e) => updatePrevJob(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Nome completo do Supervisor *</Label>
                        <Input
                          value={job.supervisorName}
                          onChange={(e) => updatePrevJob(index, 'supervisorName', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Descrição das funções *</Label>
                        <Textarea
                          value={job.jobDescription}
                          onChange={(e) => updatePrevJob(index, 'jobDescription', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 11 - University */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <GraduationCap className="h-5 w-5" />
                11. Universitário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Frequentou escola ou universidade? *</Label>
                <Select
                  value={formData.hasUniversity}
                  onValueChange={(value) => handleSelectChange('hasUniversity', value)}
                 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione SIM ou NÃO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.hasUniversity === 'SIM' && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <h4 className="font-medium text-gray-700">Escola/Universidade 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da instituição</Label>
                      <Input
                        value={formData.universityName}
                        onChange={(e) => handleInputChange('universityName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Curso</Label>
                      <Input
                        value={formData.universityCourse}
                        onChange={(e) => handleInputChange('universityCourse', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input
                        value={formData.universityZip}
                        onChange={(e) => handleUniversityCEPChange(e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={formData.universityCity}
                        onChange={(e) => handleInputChange('universityCity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        value={formData.universityState}
                        onChange={(e) => handleInputChange('universityState', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={formData.universityAddress}
                      onChange={(e) => handleInputChange('universityAddress', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número *</Label>
                      <Input
                        value={formData.universityNumber}
                        onChange={(e) => handleInputChange('universityNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Início</Label>
                      <Input
                        type="date"
                        value={formData.universityStartDate}
                        onChange={(e) => handleInputChange('universityStartDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Conclusão</Label>
                      <Input
                        type="date"
                        value={formData.universityEndDate}
                        onChange={(e) => handleInputChange('universityEndDate', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Escolas adicionais */}
                  {formData.schoolsList.map((school, index) => (
                    <div key={index} className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">Escola/Universidade {index + 2}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSchool(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome da instituição</Label>
                          <Input
                            value={school.name}
                            onChange={(e) => updateSchool(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Curso</Label>
                          <Input
                            value={school.course}
                            onChange={(e) => updateSchool(index, 'course', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>CEP</Label>
                          <Input
                            value={school.zip}
                            onChange={(e) => handleSchoolCEPChange(index, e.target.value)}
                            placeholder="00000-000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cidade</Label>
                          <Input
                            value={school.city}
                            onChange={(e) => updateSchool(index, 'city', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Estado</Label>
                          <Input
                            value={school.state}
                            onChange={(e) => updateSchool(index, 'state', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Endereço</Label>
                        <Input
                          value={school.address}
                          onChange={(e) => updateSchool(index, 'address', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data de Início</Label>
                          <Input
                            type="date"
                            value={school.startDate}
                            onChange={(e) => updateSchool(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Data de Conclusão</Label>
                          <Input
                            type="date"
                            value={school.endDate}
                            onChange={(e) => updateSchool(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" size="sm" onClick={addSchool}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar outra escola/universidade
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 12 - International Travel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <Globe className="h-5 w-5" />
                12. Viagens Internacionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Viajou nos últimos 5 anos?</Label>
                <Select
                  value={formData.traveledLast5Years}
                  onValueChange={(value) => handleSelectChange('traveledLast5Years', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.traveledLast5Years === 'SIM' && (
                <div className="space-y-2">
                  <Label>Países visitados</Label>
                  <Input
                    value={formData.traveledCountry1}
                    onChange={(e) => handleInputChange('traveledCountry1', e.target.value)}
                    placeholder="Ex: ARGENTINA, CHILE, PORTUGAL"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Idiomas que fala</Label>
                <Textarea
                  value={formData.spokenLanguages}
                  onChange={(e) => handleInputChange('spokenLanguages', e.target.value)}
                  placeholder="Ex: PORTUGUES, INGLES, ESPANHOL"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 13 - I20 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#623AA2]">
                <FileText className="h-5 w-5" />
                13. Dados do I-20 (Visto de Estudante)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Possui I-20?</Label>
                <Select
                  value={formData.hasI20}
                  onValueChange={(value) => handleSelectChange('hasI20', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO">NÃO</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.hasI20 === 'SIM' && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <Alert className="border-red-300 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Favor nos enviar uma cópia do I-20
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número do I-20</Label>
                      <Input
                        value={formData.i20Number}
                        onChange={(e) => handleInputChange('i20Number', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome da Escola</Label>
                      <Input
                        value={formData.i20SchoolName}
                        onChange={(e) => handleInputChange('i20SchoolName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Curso</Label>
                      <Input
                        value={formData.i20Course}
                        onChange={(e) => handleInputChange('i20Course', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Período do Curso</Label>
                      <Input
                        value={formData.i20CoursePeriod}
                        onChange={(e) => handleInputChange('i20CoursePeriod', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefone da Escola</Label>
                      <Input
                        value={formData.i20SchoolPhone}
                        onChange={(e) => handleInputChange('i20SchoolPhone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail da Escola</Label>
                      <Input
                        type="email"
                        value={formData.i20SchoolEmail}
                        onChange={(e) => handleEmailChange('i20SchoolEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="sticky bottom-0 bg-gray-50 py-4 -mx-4 px-4 border-t sm:border-t-0 sm:bg-transparent sm:static sm:flex sm:justify-end gap-3 sm:gap-4 sm:pb-8">
            <Button
              type="submit"
              className="bg-[#009639] hover:bg-[#007a2e] w-full sm:w-auto h-11 sm:h-10"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Enviar Formulário
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
