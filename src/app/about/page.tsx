import Link from "next/link";

const dimensionGradients = {
  tw: { from: "#1E3A5F", to: "#C4A060" },
  rd: { from: "#5A7A7A", to: "#9A6B72" },
  gf: { from: "#C8C4BC", to: "#2A4A3A" },
  ml: { from: "#7A6A8A", to: "#A07A4A" },
};

const sections = [
  {
    key: "tw",
    title: "T ↔ W · 独行与织网",
    body:
      "测量你的关系取向风格。独行端倾向独立判断、自主行动、在关系中保持边界；织网端倾向集体协商、共情行动、在关系中寻求共振。这不是“男性化”与“女性化”——研究显示所有性别的人都分布在这条光谱上，且差距在逐年缩小。",
    source:
      "理论来源：Sandra Bem (1974)、Janet Spence (1993)、David Bakan (1966) 的 Agency/Communion 框架。",
  },
  {
    key: "rd",
    title: "R ↔ D · 共鸣与异响",
    body:
      "测量你与社会性别规范之间的张力。共鸣意味着你与社会对你性别的期待之间感到和谐；异响意味着你感到摩擦。共鸣不等于未经反思，异响不等于勇敢——两端都是真实的存在状态。",
    source:
      "理论来源：Judith Butler (1990) 性别操演理论、West & Zimmerman (1987) “做性别”理论、Miqqi Alicia Gilbert (2009) 反二元性别主义四阶模型。",
  },
  {
    key: "gf",
    title: "G ↔ F · 底色与前景",
    body:
      "测量性别在你自我认同中的显著程度。底色意味着性别是你生活的背景，你很少主动思考它；前景意味着性别经常进入你的意识，深刻地影响你对自己和世界的理解。",
    source:
      "理论来源：Tobin et al. (2010) 五维性别认同模型中的“性别中心性”维度、West & Zimmerman (1987) 的 omnirelevance 概念。",
  },
  {
    key: "ml",
    title: "M ↔ L · 棱镜与激光",
    body:
      "测量你的性别表达在不同情境中的变化幅度。棱镜端在不同场合折射出不同色彩；激光端无论何处都保持同一束光。流动不等于没有真实自我，一致不等于刻板。",
    source:
      "理论来源：Gender Unicorn 多维框架 (2014)、酷儿理论对固定身份类别的质疑、R.W. Connell (1995) 的多元男性/女性气质理论。",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-6 text-foreground">
      <article className="mx-auto max-w-[640px] py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm leading-6 text-foreground transition-colors duration-200 hover:text-muted"
        >
          ← 返回
        </Link>

        <header className="mt-12">
          <h1 className="font-serif-display text-2xl italic leading-none text-foreground">
            Where This Comes From
          </h1>
          <p className="mt-4 text-base leading-[1.8] text-muted">
            这些类型从哪里来
          </p>
        </header>

        <div className="mt-16">
          {sections.map((section) => {
            const gradient =
              dimensionGradients[section.key as keyof typeof dimensionGradients];

            return (
              <section key={section.key} className="mb-12 last:mb-0">
                <div
                  className="h-0.5 w-20"
                  style={{
                    background: `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                  }}
                />
                <h2 className="mt-2 text-lg font-normal leading-[1.5] text-foreground">
                  {section.title}
                </h2>
                <p className="mt-4 text-base leading-[1.8] text-foreground">
                  {section.body}
                </p>
                <p className="mt-3 text-base leading-[1.8] text-muted">
                  {section.source}
                </p>
              </section>
            );
          })}
        </div>

        <p className="mt-12 text-base leading-[1.8] text-foreground">
          本测试还综合了以下学者的工作：Kimberlé Crenshaw（交叉性理论）、Susan
          Stryker（跨性别研究）、Lucy Nicholas（酷儿伦理）、bell
          hooks（团结政治）、Rosemary
          Garland-Thomson（女性主义残障研究）、Afsaneh
          Najmabadi（跨文化性别研究）。
        </p>

        <footer className="pb-20 pt-16">
          <Link
            href="/test"
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-8 py-4 text-sm font-medium leading-none text-background transition-opacity duration-200 hover:opacity-85"
          >
            参加测试 →
          </Link>
        </footer>
      </article>
    </main>
  );
}
