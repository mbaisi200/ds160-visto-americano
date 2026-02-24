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
import { removeAccents, formatDateToBrazilian, APPLICATION_LOCATIONS, SOCIAL_PLATFORMS, maskCPF } from '@/lib/masks';
import { toast } from 'sonner';

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
  // Section 2
  address: string;
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
  arrivalDate: string;
  stayDuration: string;
  placesToVisit: string;
  travelCity: string;
  travelState: string;
  travelSponsor: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorRelation: string;
  sponsorCity: string;
  sponsorState: string;
  sponsorZipCode: string;
  sponsorCountry: string;
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
  companionsInfo: string;
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
  fatherName: string;
  fatherBirthDate: string;
  fatherInUSA: string;
  motherName: string;
  motherBirthDate: string;
  motherInUSA: string;
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
  prevJobTitle: string;
  prevCompanyName: string;
  prevCompanyAddress: string;
  prevCompanyNeighborhood: string;
  prevCompanyCityState: string;
  prevCompanyZip: string;
  prevCompanyPhone: string;
  prevCompanyCountry: string;
  prevCompanyRole: string;
  prevSupervisorName: string;
  prevStartDate: string;
  prevEndDate: string;
  prevJobSummary: string;
  // Section 11
  hasUniversity: string;
  universityName: string;
  universityAddress: string;
  universityCity: string;
  universityState: string;
  universityZip: string;
  universityCourse: string;
  universityStartDate: string;
  universityEndDate: string;
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
  address: '',
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
  arrivalDate: '',
  stayDuration: '',
  placesToVisit: '',
  travelCity: '',
  travelState: '',
  travelSponsor: '',
  sponsorName: '',
  sponsorPhone: '',
  sponsorRelation: '',
  sponsorCity: '',
  sponsorState: '',
  sponsorZipCode: '',
  sponsorCountry: 'BRASIL',
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
  companionsInfo: '',
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
  fatherName: '',
  fatherBirthDate: '',
  fatherInUSA: '',
  motherName: '',
  motherBirthDate: '',
  motherInUSA: '',
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
  prevJobTitle: '',
  prevCompanyName: '',
  prevCompanyAddress: '',
  prevCompanyNeighborhood: '',
  prevCompanyCityState: '',
  prevCompanyZip: '',
  prevCompanyPhone: '',
  prevCompanyCountry: 'BRASIL',
  prevCompanyRole: '',
  prevSupervisorName: '',
  prevStartDate: '',
  prevEndDate: '',
  prevJobSummary: '',
  hasUniversity: '',
  universityName: '',
  universityAddress: '',
  universityCity: '',
  universityState: '',
  universityZip: '',
  universityCourse: '',
  universityStartDate: '',
  universityEndDate: '',
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
    setFormData(prev => ({
      ...prev,
      [field]: removeAccents(value.toUpperCase())
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

    // Seção 2 - Contato
    if (!formData.address) errors.push('Endereço');
    if (!formData.neighborhood) errors.push('Bairro');
    if (!formData.city) errors.push('Cidade');
    if (!formData.contactState) errors.push('Estado');
    if (!formData.zipCode) errors.push('CEP');
    if (!formData.phone1) errors.push('Telefone Principal');
    if (!formData.email) errors.push('E-mail');

    // Seção 3 - Endereço de Correspondência
    if (!formData.sameAddress) errors.push('Endereço de correspondência é o mesmo?');

    // Seção 4 - Redes Sociais
    if (!formData.hasSocialMedia) errors.push('Possui redes sociais?');

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

    // Seção 7 - Vistos Anteriores
    if (!formData.usTravelHistory) errors.push('Já teve visto para os EUA?');

    // Seção 8 - Informações Familiares
    if (!formData.relativesInUSA) errors.push('Possui parentes nos EUA?');
    
    // Se SIM para parentes nos EUA, campos são obrigatórios
    if (formData.relativesInUSA === 'SIM') {
      if (!formData.relativeName) errors.push('Nome do parente');
      if (!formData.relativeRelation) errors.push('Relação com o parente');
    }

    if (!formData.wasMarried) errors.push('Já foi casado(a)?');
    
    // Se SIM para casamento anterior, campos são obrigatórios
    if (formData.wasMarried === 'SIM') {
      if (!formData.exSpouseName) errors.push('Nome do ex-cônjuge');
      if (!formData.exSpouseBirthDate) errors.push('Data de nascimento do ex-cônjuge');
      if (!formData.marriageDate) errors.push('Data do casamento');
      if (!formData.divorceDate) errors.push('Data do divórcio');
      if (!formData.divorceReason) errors.push('Motivo do divórcio');
    }

    // Seção 9 - Ocupação Atual
    if (!formData.jobTitle) errors.push('Ocupação');
    if (!formData.companyName) errors.push('Nome da Empresa/Escola');
    if (!formData.companyAddress) errors.push('Endereço da Empresa');
    if (!formData.companyCity) errors.push('Cidade da Empresa');
    if (!formData.companyState) errors.push('Estado da Empresa');
    if (!formData.companyZip) errors.push('CEP da Empresa');
    if (!formData.companyStartDate) errors.push('Data de início');
    if (!formData.companySalary) errors.push('Remuneração');
    if (!formData.jobDescription) errors.push('Descrição das funções');

    // Seção 11 - Universitário
    if (!formData.hasUniversity) errors.push('Frequentou escola ou universidade?');

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    const errors = validateRequiredFields();
    if (errors.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${errors.slice(0, 5).join(', ')}${errors.length > 5 ? '...' : ''}`);
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    try {
      // Nome completo do cliente
      const nomeCompleto = `${formData.firstName} ${formData.lastName}`.trim();

      if (existingFormId) {
        await updateDoc(doc(db, 'ds160_forms', existingFormId), {
          dados: formData,
          nome: nomeCompleto,
          updatedAt: serverTimestamp(),
          status: 'pendente'
        });
      } else {
        await addDoc(collection(db, 'ds160_forms'), {
          userId: user?.uid,
          cpf: userData?.cpf?.replace(/\D/g, ''),
          nome: nomeCompleto,
          dados: formData,
          createdAt: serverTimestamp(),
          status: 'pendente'
        });
      }

      setSuccess(true);
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
        i === index ? { ...item, [field]: field === 'platform' ? value : removeAccents(value.toUpperCase()) } : item
      )
    }));
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

    // Section 0
    addField('0. LOCAL DE SOLICITAÇÃO', 'Local de Solicitação', formData.applicationLocation);

    // Section 1
    addField('1. INFORMAÇÕES PESSOAIS', 'Sobrenome', formData.lastName);
    addField('1. INFORMAÇÕES PESSOAIS', 'Nome', formData.firstName);
    addField('1. INFORMAÇÕES PESSOAIS', 'Utilizou outro nome', formData.usedOtherName);
    if (formData.usedOtherName === 'SIM') {
      addField('1. INFORMAÇÕES PESSOAIS', 'Antigo Sobrenome', formData.oldLastName);
      addField('1. INFORMAÇÕES PESSOAIS', 'Antigo Nome', formData.oldFirstName);
    }
    addField('1. INFORMAÇÕES PESSOAIS', 'Data de Nascimento', formatDateToBrazilian(formData.birthDate));
    addField('1. INFORMAÇÕES PESSOAIS', 'Cidade/Estado de Nascimento', formData.birthCity);
    addField('1. INFORMAÇÕES PESSOAIS', 'País de Nascimento', formData.birthCountry);
    addField('1. INFORMAÇÕES PESSOAIS', 'CPF', formData.cpf);
    addField('1. INFORMAÇÕES PESSOAIS', 'RG', formData.rg);

    // Section 2
    addField('2. INFORMAÇÕES DE CONTATO', 'Endereço', formData.address);
    addField('2. INFORMAÇÕES DE CONTATO', 'Cidade', formData.city);
    addField('2. INFORMAÇÕES DE CONTATO', 'Estado', formData.contactState);
    addField('2. INFORMAÇÕES DE CONTATO', 'CEP', formData.zipCode);
    addField('2. INFORMAÇÕES DE CONTATO', 'País', formData.country);
    addField('2. INFORMAÇÕES DE CONTATO', 'Telefone Principal', formData.phone1);
    addField('2. INFORMAÇÕES DE CONTATO', 'Telefone Opcional', formData.phone2);
    addField('2. INFORMAÇÕES DE CONTATO', 'Telefone Profissional', formData.phoneProfessional);
    addField('2. INFORMAÇÕES DE CONTATO', 'E-mail', formData.email);
    addField('2. INFORMAÇÕES DE CONTATO', 'Usou outros telefones', formData.usedOtherPhones);
    if (formData.usedOtherPhones === 'SIM') {
      addField('2. INFORMAÇÕES DE CONTATO', 'Telefones anteriores', formData.otherPhones);
    }
    addField('2. INFORMAÇÕES DE CONTATO', 'Usou outros e-mails', formData.usedOtherEmails);
    if (formData.usedOtherEmails === 'SIM') {
      addField('2. INFORMAÇÕES DE CONTATO', 'E-mails anteriores', formData.otherEmails);
    }

    // Section 3
    addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Endereço igual à residência', formData.sameAddress);
    if (formData.sameAddress === 'NAO') {
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Rua', formData.corrStreet);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Número', formData.corrNumber);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Complemento', formData.corrComplement);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Bairro', formData.corrNeighborhood);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Cidade', formData.corrCity);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'Estado', formData.corrState);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'CEP', formData.corrZipCode);
      addField('3. ENDEREÇO DE CORRESPONDÊNCIA', 'País', formData.corrCountry);
    }

    // Section 4
    if (formData.socialList.length > 0) {
      formData.socialList.forEach((s, i) => {
        addField('4. REDES SOCIAIS', `${i + 1}. ${s.platform}`, s.username);
      });
    } else {
      addField('4. REDES SOCIAIS', 'Possui redes sociais', formData.hasSocialMedia);
    }

    // Section 5
    addField('5. PASSAPORTE', 'Série', formData.passportSeries);
    addField('5. PASSAPORTE', 'Número', formData.passportNumber);
    addField('5. PASSAPORTE', 'Data de Emissão', formatDateToBrazilian(formData.passportIssueDate));
    addField('5. PASSAPORTE', 'Data de Expiração', formatDateToBrazilian(formData.passportExpiryDate));

    // Section 6
    addField('6. VIAGEM', 'Motivo da viagem', formData.travelReason);
    addField('6. VIAGEM', 'Possui planos específicos', formData.hasTravelPlans);
    addField('6. VIAGEM', 'Data de chegada pretendida', formData.arrivalDate);
    addField('6. VIAGEM', 'Tempo de permanência', formData.stayDuration);
    addField('6. VIAGEM', 'Onde deseja visitar', formData.placesToVisit);
    addField('6. VIAGEM', 'Quem patrocina a viagem', formData.travelSponsor);
    if (formData.travelSponsor === 'OUTROS') {
      addField('6. VIAGEM', 'Nome do Patrocinador', formData.sponsorName);
      addField('6. VIAGEM', 'Telefone do Patrocinador', formData.sponsorPhone);
      addField('6. VIAGEM', 'Relação', formData.sponsorRelation);
      addField('6. VIAGEM', 'Cidade do Patrocinador', formData.sponsorCity);
      addField('6. VIAGEM', 'Estado do Patrocinador', formData.sponsorState);
      addField('6. VIAGEM', 'CEP do Patrocinador', formData.sponsorZipCode);
      addField('6. VIAGEM', 'País do Patrocinador', formData.sponsorCountry);
    }
    addField('6. VIAGEM', 'Rua (EUA)', formData.usStreet);
    addField('6. VIAGEM', 'Número (EUA)', formData.usNumber);
    addField('6. VIAGEM', 'Complemento (EUA)', formData.usComplement);
    addField('6. VIAGEM', 'Cidade (EUA)', formData.usCity);
    addField('6. VIAGEM', 'Estado (EUA)', formData.usState);
    addField('6. VIAGEM', 'Zip Code (EUA)', formData.usZipCode);
    addField('6. VIAGEM', 'Companheiros de viagem', formData.travelCompanions);
    if (formData.travelCompanions === 'SIM') {
      addField('6. VIAGEM', 'É grupo/organização', formData.isGroup);
      if (formData.isGroup === 'SIM') {
        addField('6. VIAGEM', 'Nome do Grupo', formData.groupName);
      } else {
        addField('6. VIAGEM', 'Informações dos Companheiros', formData.companionsInfo);
      }
    }

    // Section 7
    addField('7. VISTOS ANTERIORES', 'Já teve visto EUA', formData.usTravelHistory);
    if (formData.usTravelHistory === 'SIM') {
      addField('7. VISTOS ANTERIORES', 'Data de Emissão do Visto', formatDateToBrazilian(formData.visaIssueDate));
      addField('7. VISTOS ANTERIORES', 'Data de Vencimento', formatDateToBrazilian(formData.visaExpiryDate));
      addField('7. VISTOS ANTERIORES', 'Número do Visto', formData.visaNumber);
      addField('7. VISTOS ANTERIORES', 'Última chegada', formatDateToBrazilian(formData.lastArrivalDate));
      addField('7. VISTOS ANTERIORES', 'Última saída', formatDateToBrazilian(formData.lastDepartureDate));
      addField('7. VISTOS ANTERIORES', 'Penúltima chegada', formatDateToBrazilian(formData.secondLastArrivalDate));
      addField('7. VISTOS ANTERIORES', 'Penúltima saída', formatDateToBrazilian(formData.secondLastDepartureDate));
      addField('7. VISTOS ANTERIORES', 'Visto negado/cancelado', formData.visaDenied);
      if (formData.visaDenied === 'SIM') {
        addField('7. VISTOS ANTERIORES', 'Motivo', formData.visaDeniedReason);
      }
    }

    // Section 8
    addField('8. INFORMAÇÕES FAMILIARES', 'Nome do Pai', formData.fatherName);
    addField('8. INFORMAÇÕES FAMILIARES', 'Data Nasc. Pai', formatDateToBrazilian(formData.fatherBirthDate));
    addField('8. INFORMAÇÕES FAMILIARES', 'Pai nos EUA', formData.fatherInUSA);
    addField('8. INFORMAÇÕES FAMILIARES', 'Nome da Mãe', formData.motherName);
    addField('8. INFORMAÇÕES FAMILIARES', 'Data Nasc. Mãe', formatDateToBrazilian(formData.motherBirthDate));
    addField('8. INFORMAÇÕES FAMILIARES', 'Mãe nos EUA', formData.motherInUSA);
    addField('8. INFORMAÇÕES FAMILIARES', 'Parentes nos EUA', formData.relativesInUSA);
    if (formData.relativesInUSA === 'SIM') {
      addField('8. INFORMAÇÕES FAMILIARES', 'Nome do Parente', formData.relativeName);
      addField('8. INFORMAÇÕES FAMILIARES', 'Relação', formData.relativeRelation);
      addField('8. INFORMAÇÕES FAMILIARES', 'Empresa', formData.relativeCompany);
      addField('8. INFORMAÇÕES FAMILIARES', 'Endereço', formData.relativeAddress);
      addField('8. INFORMAÇÕES FAMILIARES', 'Cidade', formData.relativeCity);
      addField('8. INFORMAÇÕES FAMILIARES', 'Estado', formData.relativeState);
      addField('8. INFORMAÇÕES FAMILIARES', 'Zip Code', formData.relativeZipCode);
      addField('8. INFORMAÇÕES FAMILIARES', 'Telefone', formData.relativePhone);
      addField('8. INFORMAÇÕES FAMILIARES', 'E-mail', formData.relativeEmail);
    }
    addField('8. INFORMAÇÕES FAMILIARES', 'Nome do Cônjuge', formData.spouseName);
    addField('8. INFORMAÇÕES FAMILIARES', 'Data Nasc. Cônjuge', formatDateToBrazilian(formData.spouseBirthDate));
    addField('8. INFORMAÇÕES FAMILIARES', 'Cidade/Estado Nasc. Cônjuge', formData.spouseBirthCityState);
    addField('8. INFORMAÇÕES FAMILIARES', 'Reside mesmo endereço', formData.spouseSameAddress);
    if (formData.spouseSameAddress === 'NAO') {
      addField('8. INFORMAÇÕES FAMILIARES', 'Endereço Cônjuge', formData.spouseAddress);
      addField('8. INFORMAÇÕES FAMILIARES', 'Bairro Cônjuge', formData.spouseNeighborhood);
      addField('8. INFORMAÇÕES FAMILIARES', 'Cidade Cônjuge', formData.spouseCity);
      addField('8. INFORMAÇÕES FAMILIARES', 'Estado Cônjuge', formData.spouseState);
      addField('8. INFORMAÇÕES FAMILIARES', 'CEP Cônjuge', formData.spouseZipCode);
    }
    addField('8. INFORMAÇÕES FAMILIARES', 'Já foi casado', formData.wasMarried);
    if (formData.wasMarried === 'SIM') {
      addField('8. INFORMAÇÕES FAMILIARES', 'Nome Ex-cônjuge', formData.exSpouseName);
      addField('8. INFORMAÇÕES FAMILIARES', 'Data Nasc. Ex-cônjuge', formatDateToBrazilian(formData.exSpouseBirthDate));
      addField('8. INFORMAÇÕES FAMILIARES', 'Cidade Nasc. Ex-cônjuge', formData.exSpouseBirthCity);
      addField('8. INFORMAÇÕES FAMILIARES', 'Estado Nasc. Ex-cônjuge', formData.exSpouseBirthState);
      addField('8. INFORMAÇÕES FAMILIARES', 'Data Casamento', formatDateToBrazilian(formData.marriageDate));
      addField('8. INFORMAÇÕES FAMILIARES', 'Data Divórcio', formatDateToBrazilian(formData.divorceDate));
      addField('8. INFORMAÇÕES FAMILIARES', 'País Divórcio', formData.divorceCountry);
      addField('8. INFORMAÇÕES FAMILIARES', 'Motivo Divórcio', formData.divorceReason);
    }

    // Section 9
    addField('9. OCUPAÇÃO ATUAL', 'Ocupação', formData.jobTitle);
    addField('9. OCUPAÇÃO ATUAL', 'Empresa/Escola', formData.companyName);
    addField('9. OCUPAÇÃO ATUAL', 'Endereço', formData.companyAddress);
    addField('9. OCUPAÇÃO ATUAL', 'Cidade', formData.companyCity);
    addField('9. OCUPAÇÃO ATUAL', 'Estado', formData.companyState);
    addField('9. OCUPAÇÃO ATUAL', 'CEP', formData.companyZip);
    addField('9. OCUPAÇÃO ATUAL', 'Data Início', formatDateToBrazilian(formData.companyStartDate));
    addField('9. OCUPAÇÃO ATUAL', 'Descrição das funções', formData.jobDescription);
    addField('9. OCUPAÇÃO ATUAL', 'Remuneração', formData.companySalary);
    addField('9. OCUPAÇÃO ATUAL', 'Ganho extra', formData.extraIncomeAmount);
    addField('9. OCUPAÇÃO ATUAL', 'Descrição ganho extra', formData.extraIncomeDescription);

    // Section 10
    addField('10. OCUPAÇÃO ANTERIOR', 'Teve ocupação anterior', formData.hasPrevJob);
    if (formData.hasPrevJob === 'SIM') {
      addField('10. OCUPAÇÃO ANTERIOR', 'Ocupação', formData.prevJobTitle);
      addField('10. OCUPAÇÃO ANTERIOR', 'Empresa', formData.prevCompanyName);
      addField('10. OCUPAÇÃO ANTERIOR', 'Endereço', formData.prevCompanyAddress);
      addField('10. OCUPAÇÃO ANTERIOR', 'Bairro', formData.prevCompanyNeighborhood);
      addField('10. OCUPAÇÃO ANTERIOR', 'Cidade/Estado', formData.prevCompanyCityState);
      addField('10. OCUPAÇÃO ANTERIOR', 'CEP', formData.prevCompanyZip);
      addField('10. OCUPAÇÃO ANTERIOR', 'Telefone', formData.prevCompanyPhone);
      addField('10. OCUPAÇÃO ANTERIOR', 'País', formData.prevCompanyCountry);
      addField('10. OCUPAÇÃO ANTERIOR', 'Cargo', formData.prevCompanyRole);
      addField('10. OCUPAÇÃO ANTERIOR', 'Supervisor', formData.prevSupervisorName);
      addField('10. OCUPAÇÃO ANTERIOR', 'Data Início', formatDateToBrazilian(formData.prevStartDate));
      addField('10. OCUPAÇÃO ANTERIOR', 'Data Término', formatDateToBrazilian(formData.prevEndDate));
      addField('10. OCUPAÇÃO ANTERIOR', 'Resumo funções', formData.prevJobSummary);
    }

    // Section 11
    addField('11. UNIVERSITÁRIO', 'Frequentou universidade', formData.hasUniversity);
    if (formData.hasUniversity === 'SIM') {
      addField('11. UNIVERSITÁRIO', 'Instituição', formData.universityName);
      addField('11. UNIVERSITÁRIO', 'Endereço', formData.universityAddress);
      addField('11. UNIVERSITÁRIO', 'Cidade/Estado', formData.universityCityState);
      addField('11. UNIVERSITÁRIO', 'CEP', formData.universityZip);
      addField('11. UNIVERSITÁRIO', 'Curso', formData.universityCourse);
      addField('11. UNIVERSITÁRIO', 'Data Início', formatDateToBrazilian(formData.universityStartDate));
      addField('11. UNIVERSITÁRIO', 'Data Conclusão', formatDateToBrazilian(formData.universityEndDate));
    }

    // Section 12
    addField('12. VIAGENS INTERNACIONAIS', 'Viajou últimos 5 anos', formData.traveledLast5Years);
    addField('12. VIAGENS INTERNACIONAIS', 'Países visitados', formData.traveledCountry1);
    addField('12. VIAGENS INTERNACIONAIS', 'Idiomas', formData.spokenLanguages);

    // Section 13
    addField('13. DADOS DO I20', 'Possui I-20', formData.hasI20);
    if (formData.hasI20 === 'SIM') {
      addField('13. DADOS DO I20', 'Número I-20', formData.i20Number);
      addField('13. DADOS DO I20', 'Escola', formData.i20SchoolName);
      addField('13. DADOS DO I20', 'Curso', formData.i20Course);
      addField('13. DADOS DO I20', 'Período', formData.i20CoursePeriod);
      addField('13. DADOS DO I20', 'Telefone Escola', formData.i20SchoolPhone);
      addField('13. DADOS DO I20', 'E-mail Escola', formData.i20SchoolEmail);
    }

    // Build TXT
    let txt = 'FORMULÁRIO DS160 - VISTO AMERICANO\n';
    txt += '=====================================\n\n';
    txt += `Data de geração: ${new Date().toLocaleString('pt-BR')}\n\n`;

    Object.entries(sections).forEach(([section, items]) => {
      if (items.length > 0) {
        txt += `${section.toUpperCase()}\n`;
        txt += '='.repeat(section.length) + '\n';
        items.forEach(item => {
          txt += `${item}\n`;
        });
        txt += '\n';
      }
    });

    // Download
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DS160_${formData.firstName}_${formData.lastName}.txt`.replace(/\s+/g, '_');
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
          <Loader2 className="h-12 w-12 animate-spin text-[#B22234] mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3C3B6E] to-[#B22234] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#3C3B6E] mb-2">Formulário Enviado!</h2>
            <p className="text-gray-600 mb-6">
              Seus dados foram enviados com sucesso. Nossa equipe entrará em contato em breve.
            </p>
            <Button onClick={handleSignOut} className="w-full bg-[#B22234] hover:bg-[#8b1a28]">
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3C3B6E] to-[#B22234] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#3C3B6E] mb-2">Acesso Encerrado</h2>
            <p className="text-gray-600 mb-6">
              Seu processo já foi finalizado. Entre em contato com nossa equipe para mais informações.
            </p>
            <Button onClick={handleSignOut} className="w-full bg-[#B22234] hover:bg-[#8b1a28]">
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#3C3B6E] to-[#B22234] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">SB</span>
              </div>
              <div>
                <h1 className="font-bold text-[#3C3B6E] text-sm sm:text-base">Formulário DS160</h1>
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
          {/* Section 0 - Application Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
                <Phone className="h-5 w-5" />
                2. Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Endereço *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Input
                    value={formData.contactState}
                    onChange={(e) => handleInputChange('contactState', e.target.value)}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label>CEP *</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                   
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
                    onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                   
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
                      <Label>Rua</Label>
                      <Input
                        value={formData.corrStreet}
                        onChange={(e) => handleInputChange('corrStreet', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número</Label>
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
                      <Label>Cidade</Label>
                      <Input
                        value={formData.corrCity}
                        onChange={(e) => handleInputChange('corrCity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        value={formData.corrState}
                        onChange={(e) => handleInputChange('corrState', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CEP</Label>
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
                  <Label>Data de chegada pretendida</Label>
                  <Input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                  />
                </div>
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
                      <Label>Nome do Patrocinador</Label>
                      <Input
                        value={formData.sponsorName}
                        onChange={(e) => handleInputChange('sponsorName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={formData.sponsorPhone}
                        onChange={(e) => handleInputChange('sponsorPhone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Relação com você</Label>
                      <Input
                        value={formData.sponsorRelation}
                        onChange={(e) => handleInputChange('sponsorRelation', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={formData.sponsorCity}
                        onChange={(e) => handleInputChange('sponsorCity', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* US Address */}
              <div className="pt-4 border-t">
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
              </div>

              {/* Travel Companions */}
              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <Label>Existem pessoas que irão com você?</Label>
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
                      <Label>É grupo ou organização?</Label>
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
                      <div className="space-y-2">
                        <Label>Companheiros (nome e parentesco)</Label>
                        <Textarea
                          value={formData.companionsInfo}
                          onChange={(e) => handleInputChange('companionsInfo', e.target.value)}
                          placeholder="Ex: Maria Silva - Esposa, João Silva - Filho"
                        />
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
                <Users className="h-5 w-5" />
                8. Informações Familiares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parents */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Pai</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nome completo</Label>
                    <Input
                      value={formData.fatherName}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de nascimento</Label>
                    <Input
                      type="date"
                      value={formData.fatherBirthDate}
                      onChange={(e) => handleInputChange('fatherBirthDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Está nos EUA?</Label>
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
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-gray-700">Mãe</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nome completo</Label>
                    <Input
                      value={formData.motherName}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de nascimento</Label>
                    <Input
                      type="date"
                      value={formData.motherBirthDate}
                      onChange={(e) => handleInputChange('motherBirthDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Está nos EUA?</Label>
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
        <Label>Empresa</Label>
        <Input
          value={formData.relativeCompany}
          onChange={(e) => handleInputChange('relativeCompany', e.target.value)}
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
  </div>
)}
              </div>

              {/* Já foi casado - MOVED HERE */}
              <div className="space-y-4 pt-4 border-t">
<div className="space-y-2">
  <Label>Já foi casado(a)? *</Label>
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
        <Label>Cidade de Nascimento</Label>
        <Input
          value={formData.exSpouseBirthCity}
          onChange={(e) => handleInputChange('exSpouseBirthCity', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Estado de Nascimento</Label>
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
        <Label>País do divórcio</Label>
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

              {/* Spouse */}
              <div className="space-y-4 pt-4 border-t">
<h4 className="font-medium text-gray-700">Cônjuge</h4>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="space-y-2 md:col-span-2">
    <Label>Nome completo</Label>
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
            </CardContent>
          </Card>

          {/* Section 9 - Current Occupation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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

              <div className="space-y-2">
                <Label>Endereço *</Label>
                <Input
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label>CEP *</Label>
                  <Input
                    value={formData.companyZip}
                    onChange={(e) => handleInputChange('companyZip', e.target.value)}
                   
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
                  <Label>Remuneração (R$) *</Label>
                  <Input
                    value={formData.companySalary}
                    onChange={(e) => handleInputChange('companySalary', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição das funções *</Label>
                <Textarea
                  value={formData.jobDescription}
                  onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ganho extra</Label>
                  <Input
                    value={formData.extraIncomeAmount}
                    onChange={(e) => handleInputChange('extraIncomeAmount', e.target.value)}
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
                <Briefcase className="h-5 w-5" />
                10. Ocupação Anterior (últimos 5 anos)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Teve ocupação anterior nos últimos 5 anos?</Label>
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
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ocupação</Label>
                      <Input
                        value={formData.prevJobTitle}
                        onChange={(e) => handleInputChange('prevJobTitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome da Empresa</Label>
                      <Input
                        value={formData.prevCompanyName}
                        onChange={(e) => handleInputChange('prevCompanyName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Início</Label>
                      <Input
                        type="date"
                        value={formData.prevStartDate}
                        onChange={(e) => handleInputChange('prevStartDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Término</Label>
                      <Input
                        type="date"
                        value={formData.prevEndDate}
                        onChange={(e) => handleInputChange('prevEndDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Resumo das funções</Label>
                    <Textarea
                      value={formData.prevJobSummary}
                      onChange={(e) => handleInputChange('prevJobSummary', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 11 - University */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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

                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={formData.universityAddress}
                      onChange={(e) => handleInputChange('universityAddress', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input
                        value={formData.universityZip}
                        onChange={(e) => handleInputChange('universityZip', e.target.value)}
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 12 - International Travel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
              <CardTitle className="text-lg flex items-center gap-2 text-[#3C3B6E]">
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
                        onChange={(e) => handleInputChange('i20SchoolEmail', e.target.value.toLowerCase())}
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
              type="button"
              variant="outline"
              onClick={generateTXT}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              <Download className="h-4 w-4 sm:mr-2" /> <span className="sm:inline">Gerar TXT</span>
            </Button>
            <Button
              type="submit"
              className="bg-[#B22234] hover:bg-[#8b1a28] w-full sm:w-auto h-11 sm:h-10"
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
