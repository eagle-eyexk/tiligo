import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LOGO_URL, COMPANY_INFO } from "@/lib/constants";
import Navbar from "@/components/tiligo/Navbar";
import { ArrowLeft, Mail, MapPin, Phone, FileText, Shield, Users, Zap, Globe, Award, ChevronDown, ChevronUp, Facebook } from "lucide-react";

const HERO_IMAGES = [
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/7594f645f_IMG_0085.jpeg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/063e5673b_IMG_0099.jpg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/af35b0d9e_IMG_0103.jpg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/fbcea18ca_IMG_0101.jpg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/c4008c533_IMG_0100.jpg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/f2c279261_IMG_0102.jpg",
];

const TABS = ["Rreth Nesh", "Udhëheqja", "Kontratat", "Impressum", "Kontakti"];

export default function About() {
  const [activeTab, setActiveTab] = useState("Rreth Nesh");
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />

      {/* Hero with blurred backgrounds */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Image collage blurred background */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
          {HERO_IMAGES.map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "blur(4px) brightness(0.4)" }} />
            </div>
          ))}
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <img src={LOGO_URL} alt="TiliGo" className="w-20 h-20 rounded-3xl object-cover mb-6 shadow-2xl shadow-primary/40" />
          <h1 className="font-heading font-black text-4xl md:text-6xl text-white mb-4 tracking-tight">
            Infrastruktura e <span className="gradient-text">Dërgesave</span><br />të Ardhmes
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl font-light">
            TiliGo është platforma lider e logjistikës urbane në Kosovë — duke lidhur konsumatorët, bizneset dhe korrierat përmes teknologjisë së nivelit institucional.
          </p>
          <div className="flex gap-4 mt-8">
            <Link to="/" className="gradient-btn px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/30">
              Porosit Tani
            </Link>
            <a href="#impressum" className="glass px-8 py-3 rounded-2xl font-semibold text-sm text-white hover:bg-white/10 transition-all">
              Të Dhënat Ligjore
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-10 scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "gradient-btn shadow-lg shadow-primary/20" : "glass text-muted-foreground hover:text-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* === ABOUT === */}
        {activeTab === "Rreth Nesh" && (
          <div className="space-y-10">
            {/* Mission */}
            <div className="glass rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap size={24} className="text-primary" />
                </div>
                <h2 className="font-heading font-black text-2xl text-foreground">Misioni Ynë</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                TiliGo është themeluar mbi bindjen se çdo konsumator, pavarësisht vendndodhjes, meriton akses të shpejtë, të sigurt dhe të besueshëm tek produktet dhe shërbimet me cilësi të lartë. Ne ndërtojmë infrastrukturën logjistike që mundëson rritjen e ekosistemit tregtar të Kosovës.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Platforma jonë integron tregtarë lokalë, korrier profesionistë dhe konsumatorë fundorë nën një ekosistem dixhital të unifikuar — duke sjellë efikasitet operacional, transparencë të plotë dhe një përvojë të pakrahasueshme përdoruesi.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "15min", label: "Kohë mesatare dërgimi" },
                { value: "99.2%", label: "Shkalla e suksesit" },
                { value: "24/7", label: "Mbështetje operacionale" },
                { value: "2026", label: "Themeluar në Vushtrri" },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl p-6 text-center">
                  <p className="font-mono font-black text-3xl gradient-text mb-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Values */}
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground mb-6">Vlerat Themelore</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: Shield, title: "Besueshmëria", desc: "Çdo porosi trajtohet me standarde të larta sigurie dhe gjurmueshmërie të plotë." },
                  { icon: Zap, title: "Shpejtësia", desc: "Infrastruktura jonë teknologjike siguron dërgime në kohë rekord, optimizuar me AI." },
                  { icon: Users, title: "Partneriteti", desc: "Ne ndërtojmë marrëdhënie afatgjata me tregtarët dhe korrierat tona." },
                  { icon: Globe, title: "Transparenca", desc: "Gjurmim në kohë reale, fatura dixhitale dhe raportim i plotë financiar." },
                  { icon: Award, title: "Cilësia", desc: "Standarde rigoroze operacionale të kontrolluara vazhdimisht." },
                  { icon: FileText, title: "Pajtueshmëria", desc: "Plotësisht i regjistruar pranë ARBK dhe në pajtueshmëri me legjislacionin e Kosovës." },
                ].map((v, i) => (
                  <div key={i} className="glass rounded-2xl p-6 glass-hover transition-all">
                    <v.icon size={22} className="text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image showcase */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden">
              {HERO_IMAGES.map((img, i) => (
                <div key={i} className="aspect-video overflow-hidden rounded-2xl">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === LEADERSHIP === */}
        {activeTab === "Udhëheqja" && (
          <div className="space-y-8">
            <div className="glass rounded-3xl p-8">
              <h2 className="font-heading font-black text-2xl text-foreground mb-2">Ekipi Drejtues</h2>
              <p className="text-muted-foreground mb-8">Udhëheqja e TiliGo përbëhet nga profesionistë me vizion strategjik dhe ekspertizë sektoriale, të angazhuar në transformimin dixhital të logjistikës kosovare.</p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    name: "Bardh Idrizi",
                    title: "Themelues & Drejtor Ekzekutiv (CEO)",
                    bio: "Bardh Idrizi është arkitekti kryesor i vizionit të TiliGo. Me një kuptim të thellë të tregjeve të shpejta të konsumit dhe infrastrukturës dixhitale, ai ka ndërtuar platformën nga e para me fokusin e qartë në shkallëzueshmëri institucionale dhe ndikimin socio-ekonomik në Kosovë.",
                    emoji: "👔",
                    role: "Themelues"
                  },
                  {
                    name: "Bahtir Mehmeti",
                    title: "Drejtor Ekzekutiv (CEO)",
                    bio: "Bahtir Mehmeti sjell ekspertizën operacionale dhe strategjike që shndërron vizionin në ekzekutim. Me fokus të veçantë në partneritete strategjike, zgjerim territorial dhe cilësinë e shërbimit, ai siguron që TiliGo të operojë në standarde ndërkombëtare.",
                    emoji: "🎯",
                    role: "Drejtor"
                  },
                ].map((person, i) => (
                  <div key={i} className="glass rounded-2xl p-8 border border-primary/10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl mb-5">
                      {person.emoji}
                    </div>
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{person.role}</span>
                    <h3 className="font-heading font-black text-xl text-foreground mt-1 mb-1">{person.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 font-medium">{person.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{person.bio}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-8">
              <h3 className="font-heading font-bold text-lg text-foreground mb-4">Vizioni 2026–2030</h3>
              <div className="space-y-4">
                {[
                  { year: "2026", milestone: "Lansimi zyrtar në Vushtrri dhe zgjerim në 3 komuna shtesë të Kosovës." },
                  { year: "2027", milestone: "Integrimi i AI për optimizimin e rrugëve dhe parashikimin e kërkesës." },
                  { year: "2028", milestone: "Hapja e operacioneve në Maqedoninë e Veriut dhe Shqipëri." },
                  { year: "2030", milestone: "Pozicionimi si platforma lider e logjistikës urbane në Ballkanin Perëndimor." },
                ].map((v, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="shrink-0 w-16 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-primary">{v.year}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1">{v.milestone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === CONTRACTS === */}
        {activeTab === "Kontratat" && (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8">
              <h2 className="font-heading font-black text-2xl text-foreground mb-2">Kushtet e Partneritetit</h2>
              <p className="text-muted-foreground mb-6">TiliGo ofron marrëveshje transparente dhe të drejta për të gjithë palët e platformës. Çdo kontratë është hartuar në përputhje me Kodin Civil të Kosovës dhe standardet ndërkombëtare tregtare.</p>

              {[
                {
                  title: "Kontrata e Partneritetit Tregtar",
                  desc: "Bizneset partnere të TiliGo operojnë nën një marrëveshje ekskluzive që garanton listimin aktiv, menaxhimin e porosive në kohë reale dhe mbështetjen e dedikuar. Komisionet janë të negociueshme dhe transparente.",
                  points: [
                    "Komision standard: 15–25% mbi çmimin e produktit",
                    "Pagesë javore elektronike pa vonesa",
                    "Paneli i menaxhimit i integruar pa pagesë",
                    "Mbështetje prioritare 7 ditë në javë",
                  ]
                },
                {
                  title: "Marrëveshja e Korierëve Partnerë",
                  desc: "Korierët e TiliGo operojnë si partnerë të pavarur, duke përfituar fleksibilitet maksimal, pagesa të drejtpërdrejta dhe akses në teknologjinë tonë të avancuar të gjurmimit.",
                  points: [
                    "Pagesa për çdo dërgim me bonus performance",
                    "Sigurim aksidentesh gjatë orareve aktive",
                    "Trajnim fillestar i certifikuar",
                    "Akses në aplikacionin e korierëve 24/7",
                  ]
                },
                {
                  title: "Kushtet e Shërbimit për Konsumatorët",
                  desc: "TiliGo garanton standarde të larta shërbimi për çdo konsumator. Politika jonë e rimbursimit dhe menaxhimit të ankesave është e drejtpërdrejtë dhe e zbatueshme menjëherë.",
                  points: [
                    "Garanci e rimbursimit të plotë për dërgesa të dëmtuara",
                    "Mbështetje nëpërmjet chat, email dhe telefon",
                    "Mbrojtje e të dhënave personale sipas GDPR",
                    "Politikë e qartë e anulimit të porosive",
                  ]
                },
              ].map((c, i) => (
                <div key={i} className="glass rounded-2xl p-6 mb-4 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText size={18} className="text-primary" />
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.desc}</p>
                  <ul className="space-y-1.5">
                    {c.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="glass rounded-2xl p-6 border border-primary/20 bg-primary/5 mt-6">
                <p className="text-sm text-foreground font-semibold mb-1">📋 Për kontratat e plota</p>
                <p className="text-sm text-muted-foreground">Kontaktoni ekipin ligjor të TiliGo në adresën: <span className="text-primary font-mono">legal@tili-go.com</span></p>
              </div>
            </div>
          </div>
        )}

        {/* === IMPRESSUM === */}
        {activeTab === "Impressum" && (
          <div id="impressum" className="space-y-6">
            <div className="glass rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8">
                <img src={LOGO_URL} alt="TiliGo" className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                <div>
                  <h2 className="font-heading font-black text-2xl text-foreground">Impressum</h2>
                  <p className="text-muted-foreground text-sm">Të Dhënat Zyrtare të Subjektit Juridik</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  ["Emri Tregtar", COMPANY_INFO.tradeName],
                  ["Emri Ligjor", COMPANY_INFO.legalName],
                  ["Forma Juridike", "Shoqëri me Përgjegjësi të Kufizuar (Sh.P.K.)"],
                  ["Numri Unik Identifikues (NUI)", COMPANY_INFO.uniqueId],
                  ["Regjistri Tregtar", COMPANY_INFO.registry + " — Agjencia e Regjistrimit të Bizneseve të Kosovës"],
                  ["Data e Regjistrimit", COMPANY_INFO.registrationDate],
                  ["Komuna e Selisë", COMPANY_INFO.municipality],
                  ["Adresa e Selisë Ligjore", `${COMPANY_INFO.address}, ${COMPANY_INFO.municipality}, Republika e Kosovës`],
                  ["Numri i Punonjësve", COMPANY_INFO.employees.toString()],
                  ["Themelues & CEO", "Bardh Idrizi"],
                  ["Drejtor Ekzekutiv", "Bahtir Mehmeti"],
                  ["Email Zyrtar", "info@tili-go.com"],
                ].map(([label, value], i) => (
                  <div key={i} className="border-b border-border/40 pb-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{label}</p>
                    <p className="text-sm text-foreground font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border/40">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  TiliGo Delivery L.L.C. është subjekt i plotë juridik i regjistruar pranë Agjencisë së Regjistrimit të Bizneseve të Kosovës (ARBK) me numrin unik identifikues <strong className="text-foreground">812426957</strong>. Kompania operon në pajtueshmëri të plotë me Ligjin nr. 02/L-123 për Shoqëritë Tregtare të Kosovës, Ligjin nr. 04/L-174 për Mbrojtjen e Konsumatorëve, si dhe rregullativën aplikabile të Bashkimit Evropian për tregtinë elektronike dhe mbrojtjen e të dhënave personale (GDPR). Çdo mosmarrëveshje kontraktuale do të zgjidhet pranë gjykatave kompetente të Republikës së Kosovës.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* === CONTACT === */}
        {activeTab === "Kontakti" && (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8">
              <h2 className="font-heading font-black text-2xl text-foreground mb-2">Na Kontaktoni</h2>
              <p className="text-muted-foreground mb-8">Jemi të disponueshëm për partneritete, pyetje institucionale dhe mbështetje operacionale.</p>

              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Mail, label: "Email", value: "info@tili-go.com", href: "mailto:info@tili-go.com" },
                  { icon: Phone, label: "Telefon", value: "+383 49 000 000", href: "tel:+38349000000" },
                  { icon: MapPin, label: "Adresa", value: "VICIANA 4, Vushtrri, Kosovë", href: "#" },
                  { icon: Facebook, label: "Facebook", value: "facebook.com/tiligoo", href: "https://www.facebook.com/tiligoo" },
                ].map((c, i) => (
                  <a key={i} href={c.href} className="glass rounded-2xl p-6 flex flex-col items-center text-center glass-hover transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <c.icon size={20} className="text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{c.label}</p>
                    <p className="text-sm text-foreground font-medium">{c.value}</p>
                  </a>
                ))}
              </div>

              {/* FAQ */}
              <h3 className="font-semibold text-foreground mb-4">Pyetjet e Shpeshta</h3>
              <div className="space-y-2">
                {[
                  { q: "Si mund të regjistrohem si partner tregtar?", a: "Shkarkoni aplikacionin TiliGo dhe zgjidhni opsionin 'Biznes' gjatë regjistrimit. Ekipi ynë do t'ju kontaktojë brenda 24 orëve." },
                  { q: "Cilat janë kushtet për t'u bërë korrier?", a: "Duhet të jeni mbi 18 vjeç, të keni mjet transporti të regjistruar dhe dokumente të vlefshme identifikimi. Regjistrohuni direkt nga aplikacioni." },
                  { q: "Si funksionon sistemi i pagesave?", a: "Pagesat processohen çdo javë, të hënën, nëpërmjet transfertës bankare ose sistemeve të pagesave elektronike të disponueshme në Kosovë." },
                  { q: "A ofron TiliGo shërbime B2B?", a: "Po. TiliGo ofron zgjidhje logjistike të dedikuara për biznese me vëllime të larta dërgimi. Kontaktoni ekipin tonë në business@tili-go.com." },
                ].map((faq, i) => (
                  <div key={i} className="glass rounded-xl overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left">
                      <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                      {openFaq === i ? <ChevronUp size={16} className="text-primary shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}