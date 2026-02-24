'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Users,
  BadgeCheck,
  Plane,
  Clock,
  Globe
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3C3B6E] via-[#1a1a3e] to-[#B22234]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[#3C3B6E] font-bold text-sm sm:text-lg">SB</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">SB Viagens e Turismo</h1>
                <p className="text-xs sm:text-sm text-white/70 hidden sm:block">Especialistas em visto americano</p>
              </div>
            </div>
            <Link href="/login">
              <Button className="bg-[#B22234] text-white hover:bg-[#8b1a28] font-semibold text-sm sm:text-base h-10 sm:h-auto px-4 sm:px-6">
                <span className="hidden sm:inline">Acessar Sistema</span>
                <span className="sm:hidden">Acessar</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
            <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-[#ffd700]" />
            <span className="text-white text-xs sm:text-sm">Assessoria Especializada em Visto Americano</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            Formulário DS160
            <br />
            <span className="text-[#ffd700]">Visto Americano</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Preencha seu formulário DS160 de forma rápida e segura. 
            Nossa equipe auxilia em todo o processo de solicitação do visto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/login">
              <Button size="lg" className="bg-[#B22234] hover:bg-[#8b1a28] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
                Iniciar Formulário
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3C3B6E] mb-3 sm:mb-4">Como Funciona</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Processo simples para você obter seu visto americano
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-2 border-transparent hover:border-[#B22234] transition-all">
              <CardContent className="pt-6 sm:pt-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#3C3B6E] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#B22234] mb-2">1</div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#3C3B6E] mb-2">Cadastro</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Entre em contato conosco para cadastrar seu CPF no sistema
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-transparent hover:border-[#B22234] transition-all">
              <CardContent className="pt-6 sm:pt-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#B22234] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#B22234] mb-2">2</div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#3C3B6E] mb-2">Formulário DS160</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Preencha seus dados online com CPF e senha fornecidos
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-transparent hover:border-[#B22234] transition-all">
              <CardContent className="pt-6 sm:pt-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#ffd700] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Plane className="h-6 w-6 sm:h-8 sm:w-8 text-[#3C3B6E]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#B22234] mb-2">3</div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#3C3B6E] mb-2">Entrevista</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Agendamos sua entrevista no consulado e orientamos sobre o processo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3C3B6E] mb-3 sm:mb-4">Documentos Necessários</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Tenha em mãos os seguintes documentos para agilizar seu processo
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-white">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#B22234] flex-shrink-0" />
                  <h3 className="font-semibold text-[#3C3B6E] text-sm sm:text-base">Passaporte</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 ml-8 sm:ml-9">
                  Passaporte brasileiro válido
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#B22234] flex-shrink-0" />
                  <h3 className="font-semibold text-[#3C3B6E] text-sm sm:text-base">Foto 5x5cm</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 ml-8 sm:ml-9">
                  Foto recente com fundo branco
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#B22234] flex-shrink-0" />
                  <h3 className="font-semibold text-[#3C3B6E] text-sm sm:text-base">RG e CPF</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 ml-8 sm:ml-9">
                  Documentos de identificação
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#B22234] flex-shrink-0" />
                  <h3 className="font-semibold text-[#3C3B6E] text-sm sm:text-base">Comprovantes</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 ml-8 sm:ml-9">
                  Residência, renda e vínculos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#3C3B6E]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Por que nos escolher?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-[#ffd700] mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Segurança</h3>
              <p className="text-sm sm:text-base text-white/70">
                Seus dados protegidos com a mais alta tecnologia de criptografia
              </p>
            </div>

            <div className="text-center">
              <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-[#ffd700] mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Agilidade</h3>
              <p className="text-sm sm:text-base text-white/70">
                Processo simplificado e acompanhamento em tempo real
              </p>
            </div>

            <div className="text-center">
              <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-[#ffd700] mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Experiência</h3>
              <p className="text-sm sm:text-base text-white/70">
                Anos de experiência com vistos americanos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-[#B22234]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8">
            Entre em contato conosco para autorizar seu CPF e iniciar o processo de visto americano.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-[#B22234] hover:bg-gray-100 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
              Acessar Sistema
              <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a3e] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#3C3B6E] font-bold text-sm">SB</span>
            </div>
            <span className="font-semibold">SB Viagens e Turismo</span>
          </div>
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} SB Viagens e Turismo. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/40 mt-2">
            Este não é um site oficial do governo dos EUA. Somos uma assessoria especializada.
          </p>
        </div>
      </footer>
    </div>
  );
}
