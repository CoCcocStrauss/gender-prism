import Link from "next/link";

const paragraphs = [
  "这是一个半娱乐性质的自我探索工具，不是临床诊断工具、科学量表或身份认证。",
  "它测量的是你目前与社会性别系统互动的方式。它其实是一张快照，你下次做可能得到不同结果，你的颜色可能微妙地变化，这完全正常。",
  "它不对任何性别认同、性别表达或性别观念做出价值判断。认同传统性别角色、认同非二元性别、不关心性别议题...所有立场在这里都同样被尊重。",
  "你的性别体验永远受到文化背景、民族、阶级、性取向、个体情况等多重因素的影响。这个测试只能捕捉其中一小部分。",
  "本测试的理论基础来源于性别研究学术文献，包括 Judith Butler、Candace West & Don Zimmerman、R.W. Connell、Miqqi Alicia Gilbert、Kimberlé Crenshaw、Susan Stryker、Lucy Nicholas 等学者的工作。具体的维度设计和类型划分是为了可理解性和趣味性而进行的简化。",
  "我们不收集任何可识别个人身份的信息。",
];

export default function DisclaimerPage() {
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
            About This Test
          </h1>
          <p className="mt-4 text-base leading-[1.8] text-muted">关于这个测试</p>
        </header>

        <div className="mt-12 space-y-6">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-[1.8] text-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        <footer className="pb-20 pt-16">
          <Link
            href="/test"
            className="inline-flex min-h-11 items-center text-sm leading-6 text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
          >
            参加测试 →
          </Link>
        </footer>
      </article>
    </main>
  );
}
