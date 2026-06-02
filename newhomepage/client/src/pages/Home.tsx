import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Github, Linkedin, ExternalLink, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Design Philosophy: Modern Professional Minimalism
 * - Deep slate blue (#1a3a52) primary with warm amber (#d97706) accents
 * - Clean typography with Playfair Display headings and Inter body text
 * - Asymmetric layouts with generous whitespace
 * - Subtle animations and smooth transitions
 */

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }
    toast.success("메시지가 전송되었습니다!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">LS</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">Lee SeungHoon</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#about" className="text-sm font-medium hover:text-accent transition-colors">
              소개
            </a>
            <a href="#expertise" className="text-sm font-medium hover:text-accent transition-colors">
              전문 분야
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-accent transition-colors">
              연락처
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663716263100/cLLeLhzDBtn9Fjh45FJNR4/hero-background-4jityibBxuC6VdH3c9RdbN.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 fade-in-up">
              <div className="space-y-2">
                <div className="divider-accent" />
                <p className="text-accent font-semibold tracking-wide">제조 시스템 전문가</p>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Lee SeungHoon
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Manufacturing Systems, SEMI Standards, MES 분야의 전문가입니다.
                복잡한 제조 실행 시스템을 단순하고 효율적으로 설계하고 구현합니다.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground btn-hover"
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                >
                  연락하기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-hover"
                >
                  이력서 다운로드
                </Button>
              </div>
            </div>

            {/* Right: Profile Image */}
            <div className="relative h-96 md:h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl" />
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663716263100/cLLeLhzDBtn9Fjh45FJNR4/profile-accent-HTt9LSLoXSgB8bpQhQT2GA.webp"
                alt="Lee SeungHoon"
                className="relative z-10 w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="divider-accent" />
              <h2 className="text-4xl md:text-5xl font-bold">나에 대해</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">
                저는 제조 산업의 디지털 혁신을 주도하는 전문가입니다. SEMI 표준과 ISA-95 모델에 대한 깊이 있는 이해를 바탕으로,
                복잡한 제조 실행 시스템(MES)을 설계하고 최적화합니다.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mt-4">
                데이터 수집, 실시간 분석, 성능 추적 등 제조 운영의 핵심 프로세스를 자동화하고 개선하는 것에 특화되어 있습니다.
                기술적 깊이와 실무 경험을 결합하여 비즈니스 가치를 창출합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section id="expertise" className="section-padding relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663716263100/cLLeLhzDBtn9Fjh45FJNR4/expertise-section-bg-4iFka5SAXowCPCtcHEHQyP.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
          }}
        />
        <div className="container relative z-10">
          <div className="space-y-4 mb-16">
            <div className="divider-accent" />
            <h2 className="text-4xl md:text-5xl font-bold">전문 분야</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Expertise Card 1 */}
            <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">SEMI 표준</h3>
              <p className="text-muted-foreground">
                SECS/GEM, GEM300, EDA 등 반도체 산업 표준에 대한 깊이 있는 지식과 구현 경험
              </p>
            </div>

            {/* Expertise Card 2 */}
            <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">MES 시스템</h3>
              <p className="text-muted-foreground">
                제조 실행 시스템 설계, 데이터 수집, 실시간 분석 및 성능 추적 최적화
              </p>
            </div>

            {/* Expertise Card 3 */}
            <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏭</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">ISA-95 표준</h3>
              <p className="text-muted-foreground">
                제조 운영 모델 및 활동 정의, 엔터프라이즈 통합 아키텍처 설계
              </p>
            </div>

            {/* Expertise Card 4 */}
            <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">데이터 분석</h3>
              <p className="text-muted-foreground">
                실시간 데이터 수집, 이상치 탐지, OEE 계산 및 성능 분석
              </p>
            </div>

            {/* Expertise Card 5 */}
            <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">스마트 제조</h3>
              <p className="text-muted-foreground">
                IIoT, AI/ML, 디지털 트윈 등 최신 제조 기술 통합 및 최적화
              </p>
            </div>

            {/* Expertise Card 6 */}
            <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">기술 문서</h3>
              <p className="text-muted-foreground">
                복잡한 기술 내용을 명확하게 설명하고 문서화하는 전문성
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="space-y-4 mb-16">
            <div className="divider-accent" />
            <h2 className="text-4xl md:text-5xl font-bold">주요 프로젝트</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project 1 */}
            <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl">📋</span>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">SEMI 표준 가이드</h3>
                <p className="text-muted-foreground">
                  SEMI 표준의 복잡한 내용을 대화형 가이드로 제공하여 이해도를 높임
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    SEMI Standards
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Documentation
                  </span>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl">🏭</span>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">MES 아키텍처 설계</h3>
                <p className="text-muted-foreground">
                  실시간 데이터 수집 및 분석을 위한 확장 가능한 MES 시스템 아키텍처
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    MES
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Architecture
                  </span>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl">📊</span>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">ISA-95 모델 구현</h3>
                <p className="text-muted-foreground">
                  ISA-95 표준에 기반한 제조 운영 모델 및 데이터 모델 구현
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    ISA-95
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Modeling
                  </span>
                </div>
              </div>
            </div>

            {/* Project 4 */}
            <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border card-hover">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl">🔍</span>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">실시간 데이터 분석</h3>
                <p className="text-muted-foreground">
                  제조 데이터의 실시간 수집, 처리 및 이상치 탐지 시스템
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    Data Analytics
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Real-time
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding">
        <div className="container">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="divider-accent" />
              <h2 className="text-4xl md:text-5xl font-bold">연락처</h2>
              <p className="text-lg text-muted-foreground">
                프로젝트 제안, 협력 기회, 또는 기술 상담이 필요하신가요?
                아래 폼을 통해 연락주세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl border border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium">이름</label>
                <Input
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">이메일</label>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">메시지</label>
                <Textarea
                  placeholder="메시지를 입력하세요"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-background border-border resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-hover"
              >
                메시지 전송
                <Mail className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Social Links */}
            <div className="flex justify-center gap-6 pt-8">
              <a
                href="#"
                className="p-3 bg-card rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-3 bg-card rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="p-3 bg-card rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Lee SeungHoon</h3>
              <p className="text-sm opacity-90">Manufacturing Systems Specialist</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">전문 분야</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>SEMI Standards</li>
                <li>MES Systems</li>
                <li>ISA-95 Models</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">연락처</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>Email: contact@example.com</li>
                <li>Location: Seoul, Korea</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-75">
            <p>&copy; 2026 Lee SeungHoon. All rights reserved.</p>
            <p>Designed & Built with Care</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
