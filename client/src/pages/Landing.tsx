import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleKey = "admin" | "accountant" | "sales" | "warehouse";

interface ModuleToggle {
  name: string;
  price: number;
  on: boolean;
}

interface Permission {
  label: string;
  tag: string;
  yes: boolean;
}

interface RolePanel {
  key: RoleKey;
  label: string;
  who: string;
  perms: Permission[];
  copyTitle: string;
  copyBody: string;
  scenario: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const HERO_BASE_PRICE = 29;

const HERO_MODULES: ModuleToggle[] = [
  { name: "Inventory", price: 19, on: true },
  { name: "Sales / Orders", price: 19, on: true },
  { name: "Purchasing", price: 15, on: false },
  { name: "Reporting", price: 12, on: false },
];

const MAIN_MODULES: ModuleToggle[] = [
  { name: "Inventory", price: 19, on: true },
  { name: "Sales / Orders", price: 19, on: true },
  { name: "Purchasing", price: 15, on: false },
  { name: "Invoicing", price: 15, on: false },
  { name: "Multi-Warehouse", price: 25, on: false },
  { name: "Reporting", price: 12, on: false },
  { name: "CRM-lite", price: 15, on: false },
  { name: "Integration Hub", price: 29, on: false },
];

const MODULE_CARDS = [
  {
    title: "Inventory",
    desc: "Məhsul kataloqu, SKU, stok səviyyəsi və minimum-stok xəbərdarlıqları.",
    roles: "Rəhbər · Mühasib · Anbar",
    phase2: false,
  },
  {
    title: "Sales / Orders",
    desc: "Sifariş yaratma, status izləmə, endirim üçün təsdiq axını.",
    roles: "Satış Meneceri · Nümayəndə",
    phase2: false,
  },
  {
    title: "Purchasing",
    desc: "Təchizatçı kataloqu, satınalma sifarişləri, büdcə təsdiqi.",
    roles: "Satınalma · Mühasib",
    phase2: false,
  },
  {
    title: "Invoicing",
    desc: "Sifarişdən birklikli faktura, ödəniş statusu, gecikmə izləmə.",
    roles: "Mühasib",
    phase2: false,
  },
  {
    title: "Multi-Warehouse",
    desc: "Bir neçə anbar/filial arasında stok izləmə və transfer idarəetməsi.",
    roles: "Rəhbər · Anbar Meneceri",
    phase2: false,
  },
  {
    title: "Reporting",
    desc: "Satış trendi, marja, stok dövriyyəsi — bir ekranda.",
    roles: "Rəhbər · Mühasib",
    phase2: false,
  },
  {
    title: "CRM-lite",
    desc: "Müştəri tarixçəsi, satıcı təyinatı, sifariş etməyən müştəri xatırlatması.",
    roles: "Faza 2",
    phase2: true,
  },
  {
    title: "Integration Hub",
    desc: "Marketplace, mühasibatlıq və ödəniş sistemləri ilə qoşulma.",
    roles: "Faza 2",
    phase2: true,
  },
];

const ROLE_PANELS: RolePanel[] = [
  {
    key: "admin",
    label: "Rəhbər",
    who: "Rəhbər // görünüş",
    perms: [
      { label: "Maya dəyəri və marja", tag: "Dəyişə bilər", yes: true },
      { label: "Qiymət təklifini təsdiqləmək", tag: "Edə bilər", yes: true },
      { label: "İcazələri idarə etmək", tag: "Edə bilər", yes: true },
      { label: "Bütün anbarlar və komandalar", tag: "Görür", yes: true },
    ],
    copyTitle: "Tam mənzərə, tək ekranda",
    copyBody:
      "Komandanızın gördüyü işi, qiymət təkliflərini, gecikmiş ödənişləri və stok vəziyyətini bir yerdən izləyirsiniz — istənilən təsdiqi siz verirsiniz.",
    scenario: `"3 yeni qiymət təklifi təsdiq gözləyir" bildirişini alır, maya dəyəri ilə təklif olunan qiyməti yan-yana görüb bir kliklə təsdiqləyir.`,
  },
  {
    key: "accountant",
    label: "Mühasib",
    who: "Mühasib // görünüş",
    perms: [
      { label: "Maya dəyəri", tag: "Dəyişə bilər", yes: true },
      { label: "Faktura yaratmaq", tag: "Edə bilər", yes: true },
      { label: "Qiymət təsdiqi", tag: "Yoxdur", yes: false },
      { label: "İcazə idarəetməsi", tag: "Yoxdur", yes: false },
    ],
    copyTitle: "Maliyyə datası tək əldə",
    copyBody:
      "Maya dəyərini daxil edir, fakturaları sifarişdən birbaşa yaradır, gecikmiş ödənişləri izləyir — Excel-ə paralel köçürmə yoxdur.",
    scenario:
      "Yeni məhsul kartına maya dəyərini yazır; bu sahəni yalnız o və Rəhbər görür, satış komandası görmür.",
  },
  {
    key: "sales",
    label: "Satış Nümayəndəsi",
    who: "Satış Nümayəndəsi // görünüş",
    perms: [
      { label: "Maya dəyəri", tag: "Görmür", yes: false },
      { label: "Satış qiyməti təklif etmək", tag: "Edə bilər", yes: true },
      { label: "Öz sifarişləri", tag: "Görür", yes: true },
      { label: "Komandanın bütün sifarişləri", tag: "Görmür", yes: false },
    ],
    copyTitle: "Sadə, məhdudlaşdırılmış görünüş",
    copyBody:
      "Yalnız öz müştəriləri və sifarişləri üzərində işləyir, qiymət təklif edir — son söz həmişə Rəhbərdədir.",
    scenario:
      'Standart qiymətdən aşağı endirim versə, sistem avtomatik "Təsdiq tələb olunur" qoyur və Satış Menecerinə bildiriş gedir.',
  },
  {
    key: "warehouse",
    label: "Anbar İşçisi",
    who: "Anbar İşçisi // görünüş",
    perms: [
      { label: "Qiymət məlumatları", tag: "Görmür", yes: false },
      { label: "Stok sayını dəyişmək", tag: "Edə bilər", yes: true },
      { label: "Mal qəbulunu qeyd etmək", tag: "Edə bilər", yes: true },
      { label: "Maliyyə hesabatları", tag: "Görmür", yes: false },
    ],
    copyTitle: "Yalnız fiziki əməliyyat",
    copyBody:
      'Stokun gəlişini, çıxışını və lokasiyasını qeyd edir — qiymət və maliyyə datasından tamamilə təcrid olunub.',
    scenario:
      'Mal anbara gələndə "qəbul edildi" deyir — stok avtomatik artır, Mühasibin görəcəyi maya dəyəri də sənəddən özü dolur.',
  },
];

const TIER_CARDS = [
  {
    name: "Starter",
    sub: "Mikro-bizneslər üçün başlanğıc",
    price: "49 AZN",
    users: "5 istifadəçiyə qədər",
    features: ["Core platforma", "Inventory modulu", "Əsas hesabatlar"],
    featured: false,
  },
  {
    name: "Growth",
    sub: "Aktif satışı olan komandalar",
    price: "99 AZN",
    users: "20 istifadəçiyə qədər",
    features: ["Starter-də olan hər şey", "Sales/Orders + Purchasing", "Tam Reporting"],
    featured: true,
  },
  {
    name: "Business",
    sub: "Çox filiallı, böyüyən bizneslər",
    price: "179 AZN",
    users: "50 istifadəçiyə qədər",
    features: ["Growth-da olan hər şey", "Multi-Warehouse + Invoicing", "CRM-lite"],
    featured: false,
  },
  {
    name: "Enterprise",
    sub: "Xüsusi ehtiyaclar üçün",
    price: "Fərdi",
    users: "Limitsiz istifadəçi",
    features: ["Bütün modullar", "Integration Hub", "Xüsusi SLA və dəstək"],
    featured: false,
  },
];

// ─── Helper: compute price from toggles ──────────────────────────────────────

function calcTotal(base: number, modules: ModuleToggle[]): number {
  return modules.reduce((sum, m) => (m.on ? sum + m.price : sum), base);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ModuleCalcProps {
  id: string;
  totalId: string;
  modules: ModuleToggle[];
  base: number;
  onToggle: (index: number) => void;
}

function ModuleCalc({ id, totalId, modules, base, onToggle }: ModuleCalcProps) {
  const total = calcTotal(base, modules);
  return (
    <>
      <div className="toggle-list" id={id}>
        {modules.map((m, i) => (
          <div
            key={m.name}
            className={`toggle-row${m.on ? " is-on" : ""}`}
            data-price={m.price}
            onClick={() => onToggle(i)}
            role="switch"
            aria-checked={m.on}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(i);
              }
            }}
          >
            <span className="t-name">
              <span className="dot" />
              {m.name}
            </span>
            <span className="t-price">{m.price} AZN</span>
            <span className="switch" />
          </div>
        ))}
      </div>
      <div className="console-total">
        <span className="ct-label">Aylıq, Core daxil</span>
        <span className="ct-value" id={totalId}>
          {total} AZN<span>/ay</span>
        </span>
      </div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();

  // ── State ──
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState<RoleKey>("admin");
  const [heroModules, setHeroModules] = useState<ModuleToggle[]>(HERO_MODULES);
  const [mainModules, setMainModules] = useState<ModuleToggle[]>(MAIN_MODULES);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // ── Toggle helpers ──
  const toggleHeroModule = useCallback((index: number) => {
    setHeroModules((prev) =>
      prev.map((m, i) => (i === index ? { ...m, on: !m.on } : m))
    );
  }, []);

  const toggleMainModule = useCallback((index: number) => {
    setMainModules((prev) =>
      prev.map((m, i) => (i === index ? { ...m, on: !m.on } : m))
    );
  }, []);

  // ── Side effects ──
  useEffect(() => {
    // Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Header scroll
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Scroll-reveal (IntersectionObserver)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | null = null;
    if (!reduceMotion && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in-view");
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      document.querySelectorAll(".reveal").forEach((el) => io?.observe(el));
    } else {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
      document.head.removeChild(link);
    };
  }, []);

  // ── Form submit ──
  const handleDemoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  // ── Active role panel ──
  const activePanel = ROLE_PANELS.find((p) => p.key === activeRole)!;

  return (
    <div className="landing-page">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header id="siteHeader" className={scrolled ? "scrolled" : ""}>
        <div className="wrap">
          <a style={{ cursor: "pointer" }} className="logo" onClick={() => window.scrollTo({
            top: 0,
            behavior: "smooth",
          })}>
            <img src="/pms-favicon.png" alt="PMS Logo" style={{ width: "28px", height: "28px", borderRadius: "8px", objectFit: "cover", display: "inline-block", verticalAlign: "middle", marginRight: "6px" }} />{" "}
            PMS</a>

          <nav className="primary-nav" aria-label="Əsas naviqasiya">
            <ul>
              <li><a href="#modullar">Modullar</a></li>
              <li><a href="#rollar">Rollar</a></li>
              <li><a href="#qiymet">Qiymətlər</a></li>
              <li><a href="#elaqe">Əlaqə</a></li>
            </ul>
          </nav>

          <div className="header-actions">
            <button className="btn btn-ghost" onClick={() => navigate("/register")}>
              Pulsuz başla
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              Daxil ol
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="hero" id="top">
        <div className="wrap hero-grid">
          {/* Left: Copy */}
          <div>
            <p className="eyebrow">Əməliyyat İdarəetmə Platforması</p>
            <h1>
              Sistemə lazım olanı <em>yandırın.</em>
              <br />
              Qalanına pul verməyin.
            </h1>
            <p className="lede">
              PMS — anbarınızı, satışınızı, satınalmanı və komandanızı tək yerdən idarə
              edən modulyar platforma. ERP-in nizamı, Excel-in sadəliyi — aralıqdakı
              boşluğu doldurur.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => navigate("/register")}>
                Pulsuz sınaq başlat
              </button>
              <a href="#modullar" className="btn btn-ghost">
                Modulları gör
              </a>
            </div>
            <div className="hero-meta">
              <div>
                <strong>8</strong>seçilə bilən modul
              </div>
              <div>
                <strong>7</strong>rol-əsaslı icazə səviyyəsi
              </div>
              <div>
                <strong>~10 dəq</strong>qurulum müddəti
              </div>
            </div>
          </div>

          {/* Right: Interactive calculator */}
          <div className="console reveal">
            <div className="console-bar">
              <div className="console-dots">
                <span /><span /><span />
              </div>
              <div className="label">PMS // ÖZ PAKETİNİ QUR</div>
            </div>
            <div className="console-body">
              <p className="console-row-label">Modulları seçin</p>
              <ModuleCalc
                id="heroCalc"
                totalId="heroTotal"
                modules={heroModules}
                base={HERO_BASE_PRICE}
                onToggle={toggleHeroModule}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM / COMPARISON ───────────────────────────────────── */}
      <section className="problem">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Niyə PMS</p>
            <h2>Excel ilə tam ERP arasında boşluq var</h2>
            <p className="lede">
              Çoxu ya çox primitiv, ya da çox ağır alətlər arasında seçim etməyə
              məcburdur. Üçüncü yol var.
            </p>
          </div>

          <div className="compare-grid">
            {/* Excel */}
            <div className="compare-card reveal">
              <span className="badge">Cədvəl / Excel</span>
              <h3>Sadə, amma kor</h3>
              <ul>
                {[
                  "Komanda işi qarışır, versiya itir",
                  "İcazə nəzarəti yoxdur — hər kəs hər şeyi görür",
                  "Real-vaxt stok məlumatı yoxdur",
                ].map((text) => (
                  <li key={text}>
                    <svg className="ico" viewBox="0 0 16 16" stroke="#C8506B" fill="none" strokeWidth="2">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* PMS */}
            <div className="compare-card featured reveal">
              <span className="badge">PMS</span>
              <h3>Lazım olanı seç, işlə</h3>
              <ul>
                {[
                  "Yalnız ehtiyacınız olan modulları aktivləşdirin",
                  "Rol-əsaslı icazələr — kim nəyi görür, siz təyin edirsiniz",
                  "Bir neçə gün ərzində işə düşür, aylarla layihə deyil",
                ].map((text) => (
                  <li key={text}>
                    <svg className="ico" viewBox="0 0 16 16" stroke="#1FAE6E" fill="none" strokeWidth="2">
                      <path d="M3 8.5l3.5 3.5L13 5" />
                    </svg>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* ERP */}
            <div className="compare-card reveal">
              <span className="badge">Tam ERP</span>
              <h3>Güclü, amma ağır</h3>
              <ul>
                {[
                  "Tətbiqi aylarla çəkir, baha başa gəlir",
                  "İstifadə etmədiyiniz modullara da ödəyirsiniz",
                  "Öyrənmə əyrisi komandanı yorur",
                ].map((text) => (
                  <li key={text}>
                    <svg className="ico" viewBox="0 0 16 16" stroke="#C8506B" fill="none" strokeWidth="2">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM / ARCHITECTURE ────────────────────────────────── */}
      <section className="platform" id="platforma">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Necə qurulub</p>
            <h2>Bir nüvə, seçilə bilən modullar</h2>
            <p className="lede">
              Core platforma istifadəçi, icazə və bildirişləri idarə edir. Hər modul
              ona qoşulur — yalnız lazım olanı yandırırsınız.
            </p>
          </div>

          <div className="arch">
            <div className="arch-diagram reveal">
              <div className="core-node">
                CORE PLATFORMA
                <small>Auth · Rollar · Bildirişlər</small>
              </div>
              <div className="branch-line" />
              <div className="module-nodes">
                {["INVENTORY", "SALES", "PURCHASING", "INVOICING", "WAREHOUSE", "REPORTING", "CRM-LITE", "INTEGRATIONS"].map(
                  (m) => (
                    <div key={m} className="module-node">{m}</div>
                  )
                )}
              </div>
            </div>

            <div className="arch-copy reveal">
              <ul>
                {[
                  {
                    num: "01",
                    title: "Bir dəfə qurursunuz",
                    body: "İstifadəçilər, rollar və icazələr Core-da bir dəfə təyin olunur — hər modulda təkrarlanmır.",
                  },
                  {
                    num: "02",
                    title: "İstədiyinizi yandırırsınız",
                    body: "Inventory ilə başlayın, böyüdükcə Satış, Satınalma, Anbar modullarını əlavə edin.",
                  },
                  {
                    num: "03",
                    title: "Data bir yerdə qalır",
                    body: "Modullar bir-biri ilə danışır — Satış stoku azaldır, Satınalma onu doldurur, hamısı sinxron.",
                  },
                ].map((item) => (
                  <li key={item.num}>
                    <span className="num">{item.num}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULES ────────────────────────────────────────────────── */}
      <section className="modules" id="modullar">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Modullar</p>
            <h2>Biznesinizin böyüməsinə uyğun genişlənir</h2>
            <p className="lede">
              Hər modul müstəqil işləyir, amma birlikdə daha güclüdür.
            </p>
          </div>

          <div className="module-grid">
            {MODULE_CARDS.map((m) => (
              <div
                key={m.title}
                className={`module-card reveal${m.phase2 ? " phase2" : ""}`}
              >
                <div className="ico-box">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 7l9-4 9 4-9 4-9-4z" />
                    <path d="M3 7v10l9 4 9-4V7" />
                    <path d="M12 11v10" />
                  </svg>
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <span className="role-chip">{m.roles}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ──────────────────────────────────────────────────── */}
      <section className="roles" id="rollar">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Kim nəyi görür</p>
            <h2>Hər rol yalnız bilməli olduğunu görür</h2>
            <p className="lede">
              İcazələri siz təyin edirsiniz. Mühasib maya dəyərini görür, satış
              nümayəndəsi yalnız təklif edir, rəhbər hər ikisini təsdiqləyir.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="role-tabs" id="roleTabs" role="tablist">
            {ROLE_PANELS.map((r) => (
              <button
                key={r.key}
                id={`tab-${r.key}`}
                role="tab"
                aria-selected={activeRole === r.key}
                aria-controls={`panel-${r.key}`}
                className={`role-tab${activeRole === r.key ? " active" : ""}`}
                onClick={() => setActiveRole(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Active panel — rendered from state, no DOM queries needed */}
          <div
            id={`panel-${activePanel.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${activePanel.key}`}
            className="role-panel active"
          >
            <div className="console-mini reveal">
              <p className="who">{activePanel.who}</p>
              {activePanel.perms.map((perm) => (
                <div key={perm.label} className="perm-row">
                  <span>{perm.label}</span>
                  <span className={`perm-tag ${perm.yes ? "yes" : "no"}`}>
                    {perm.tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="role-copy">
              <h3>{activePanel.copyTitle}</h3>
              <p>{activePanel.copyBody}</p>
              <p className="scenario">{activePanel.scenario}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────── */}
      <section className="pricing" id="qiymet">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Qiymətlər</p>
            <h2>Böyüməyə uyğun paketlər</h2>
            <p className="lede">
              Hazır paketdən başlayın və ya öz kombinasiyanızı qurun — hər iki halda
              yalnız istifadə etdiyinizə görə ödəyirsiniz.
            </p>
          </div>

          <div className="tier-grid">
            {TIER_CARDS.map((tier) => (
              <div
                key={tier.name}
                className={`tier-card reveal${tier.featured ? " featured" : ""}`}
              >
                <h3>{tier.name}</h3>
                <p className="tier-sub">{tier.sub}</p>
                <div className="tier-price">
                  {tier.price}
                  <span>/ay</span>
                </div>
                <div className="tier-users">{tier.users}</div>
                <ul>
                  {tier.features.map((f) => (
                    <li key={f}>
                      <svg className="ico" viewBox="0 0 16 16">
                        <path d="M3 8.5l3.5 3.5L13 5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${tier.featured ? "btn-primary" : "btn-ghost-light"}`}
                  onClick={() =>
                    tier.name === "Enterprise"
                      ? (document.getElementById("elaqe")?.scrollIntoView({ behavior: "smooth" }))
                      : navigate("/register")
                  }
                >
                  {tier.name === "Enterprise" ? "Əlaqə saxla" : "Başla"}
                </button>
              </div>
            ))}
          </div>

          {/* Custom calculator */}
          <div className="calc reveal">
            <div className="calc-copy">
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Öz paketini qur
              </p>
              <h3>Yalnız lazım olana ödəyin</h3>
              <p>
                Core platforma (istifadəçi, rol, bildiriş idarəetməsi) bütün paketlərə
                daxildir — 29 AZN/ay. Üzərinə yalnız istifadə edəcəyiniz modulları
                əlavə edin.
              </p>
            </div>
            <div>
              <div className="calc-modules">
                <ModuleCalc
                  id="mainCalc"
                  totalId="mainTotal"
                  modules={mainModules}
                  base={HERO_BASE_PRICE}
                  onToggle={toggleMainModule}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────────────── */}
      <section className="contact" id="elaqe">
        <div className="wrap contact-grid">
          <div className="contact-copy reveal">
            <p className="eyebrow">Başlayaq</p>
            <h2>Komandanızla 20 dəqiqəlik demo planlaşdıraq</h2>
            <p className="lede">
              Konkret iş axınınızı görüb, hansı modulların sizə uyğun olduğunu
              birlikdə müəyyən edək.
            </p>
            <div className="contact-points">
              <div>
                <svg className="ico" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                Demo ~20 dəqiqə çəkir, satış təzyiqi yoxdur
              </div>
              <div>
                <svg className="ico" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 9h16" />
                </svg>
                Excel/cədvəl datanızın köçürülməsində kömək edirik
              </div>
              <div>
                <svg className="ico" viewBox="0 0 24 24">
                  <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />
                </svg>
                14 günlük pulsuz sınaq, kart məlumatı tələb olunmur
              </div>
            </div>
          </div>

          <div className="form-card reveal">
            {formSubmitted ? (
              <div className="form-success show">
                <svg className="ico" viewBox="0 0 24 24">
                  <path d="M3 12.5l5.5 5.5L21 6" />
                </svg>
                <h4>Sorğunuz qəbul edildi</h4>
                <p>Komandamız 24 saat ərzində sizinlə əlaqə saxlayacaq.</p>
              </div>
            ) : (
              <form id="demoForm" onSubmit={handleDemoSubmit} noValidate>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="fname">Ad Soyad</label>
                    <input id="fname" type="text" placeholder="Adınız" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="fcompany">Şirkət</label>
                    <input id="fcompany" type="text" placeholder="Şirkət adı" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="femail">E-poçt</label>
                    <input id="femail" type="email" placeholder="email@sirket.az" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="fphone">Telefon</label>
                    <input id="fphone" type="tel" placeholder="+994 50 000 00 00" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full">
                    <label htmlFor="fmsg">Qısa qeyd</label>
                    <textarea
                      id="fmsg"
                      rows={3}
                      placeholder="Hansı problemi həll etmək istəyirsiniz?"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Demo tələb et
                </button>
                <p className="form-note">24 saat ərzində geri dönüş təmin edirik.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer>
        <div className="wrap">
          <div className="footer-top">
            <div>
              <a className="logo">
                <img src="/pms-favicon.png" alt="PMS Logo" style={{ width: "28px", height: "28px", borderRadius: "8px", objectFit: "cover", display: "inline-block", verticalAlign: "middle", marginRight: "6px" }} />{" "}
                PMS
              </a>
              <p>
                Modulyar əməliyyat idarəetmə platforması — anbar, satış, satınalma və
                komandanız tək yerdə.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-col">
                <h4>Platforma</h4>
                <ul>
                  <li><a href="#modullar">Modullar</a></li>
                  <li><a href="#rollar">Rollar və icazələr</a></li>
                  <li><a href="#qiymet">Qiymətlər</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Şirkət</h4>
                <ul>
                  <li><a href="#elaqe">Əlaqə</a></li>
                  <li>
                    <button
                      className="footer-link-btn"
                      onClick={() => navigate("/register")}
                    >
                      Pulsuz başla
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 PMS. Bütün hüquqlar qorunur.</span>
            <span>Bakı, Azərbaycan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
