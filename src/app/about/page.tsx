import Link from "next/link";

const dimensionGradients = {
  s: { from: "#1E3A5F", to: "#C4A060" },
  r: { from: "#5A7A7A", to: "#9A6B72" },
  d: { from: "#C8C4BC", to: "#2A4A3A" },
  c: { from: "#7A6A8A", to: "#A07A4A" },
};

type AboutPageProps = {
  searchParams?: Promise<{
    from?: string;
  }>;
};

const sections = [
  {
    key: "s",
    title: "s ↔ S · 性别图式激活",
    body:
      "这个维度测量你在多大程度上自动地按性别来理解和分类世界。有些人遇到陌生人时会很快注意到对方的性别，有些人对此不太在意。这种差异不是观念问题，而是认知加工方式的不同。",
    source:
      "Sandra Bem (1981) 性别图式理论；Cecilia Ridgeway (2009) 性别作为首要认知框架",
  },
  {
    key: "r",
    title: "r ↔ R · 性别实践反思性",
    body:
      "这个维度测量你在多大程度上能看到性别规范是怎样影响你和周围人的。大多数人在大多数时候并不知道自己在「做性别」。有些人开始注意到了。注意到不一定意味着反对，没注意到也不意味着顺从。",
    source:
      "Patricia Martin (2003) 性别化实践与实践性别；Lois McNay (1999) 性别惯习与场域",
  },
  {
    key: "d",
    title: "d ↔ D · 性别动力学方向",
    body:
      "这个维度测量你的存在和行为倾向于让性别在人际互动中变得更明显还是更淡。有些人自然地强化性别的存在感，有些人自然地弱化它。强化不等于保守，弱化不等于进步。",
    source:
      "West & Zimmerman (1987) 做性别；Francine Deutsch (2007) 取消做性别",
  },
  {
    key: "c",
    title: "c ↔ C · 跨场域一致性",
    body:
      "这个维度测量你的性别表达在不同场合中是比较一致的，还是差别比较大。一致性高不等于刻板，变化大不等于虚伪。不同的场合对人有不同的要求，有些人对此敏感，有些人不太受影响。",
    source:
      "McNay (1999) 性别惯习与场域；Bourdieu (1990) 实践的逻辑",
  },
] as const;

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const { from } = (await searchParams) ?? {};
  const returnHref = getSafeReturnHref(from);

  return (
    <main className="min-h-screen bg-background px-6 text-foreground">
      <article className="mx-auto max-w-[640px] py-10 sm:py-14">
        <Link
          href={returnHref}
          className="inline-flex min-h-11 items-center text-sm leading-6 text-foreground transition-colors duration-200 hover:text-muted"
        >
          ← 返回
        </Link>

        <header className="mt-12">
          <h1 className="font-serif-display text-2xl italic leading-none text-foreground">
            Where This Comes From
          </h1>
          <p className="mt-4 text-base leading-[1.8] text-muted">
            这些维度从哪里来
          </p>
        </header>

        <div className="mt-16">
          {sections.map((section) => {
            const gradient =
              dimensionGradients[section.key as keyof typeof dimensionGradients];

            return (
              <section key={section.key} className="mb-12 last:mb-0">
                <h2 className="mt-2 text-lg font-normal leading-[1.5] text-foreground">
                  {section.title}
                </h2>
                <div
                  className="mt-3 h-0.5 w-24"
                  style={{
                    background: `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                  }}
                />
                <p className="mt-4 text-base leading-[1.8] text-foreground">
                  {section.body}
                </p>
                <p className="mt-3 text-base leading-[1.8] text-muted">
                  来源：{section.source}
                </p>
              </section>
            );
          })}
        </div>

        <p className="mt-12 text-base leading-[1.8] text-foreground">
          本测试还参考了以下学者的工作：Judith Butler（性别操演理论）、R.W.
          Connell（多元男性气质/女性气质理论）、Barbara
          Risman（性别作为社会结构）、Kimberlé
          Crenshaw（交叉性理论）、Anne Fausto-Sterling（动态系统模型）。
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

function getSafeReturnHref(from: string | undefined): string {
  if (!from?.startsWith("/result/")) {
    return "/";
  }

  return from;
}
