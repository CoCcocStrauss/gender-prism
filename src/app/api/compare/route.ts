import { NextRequest, NextResponse } from "next/server";

const fallbackText =
  "两个不同的棱镜折射出不同的光。你们之间的互动模式很难被简单概括，但差异本身就是对话的起点。";

export async function POST(req: NextRequest) {
  const { typeA, typeB, scoresA, scoresB } = await req.json();

  const systemPrompt = `你是 Gender Prism 的互动分析师。根据两个人的性别互动模式，生成一段关于他们之间互动特征的分析。

四个维度的含义：
- S（性别图式激活）：0%=几乎不按性别分类世界，100%=高度自动地按性别组织信息
- R（反思性）：0%=觉得性别的运作方式是自然的不需分析，100%=能清楚看到性别规范在运作
- D（动力学方向）：0%=互动中倾向于让性别变得不显著，100%=互动中倾向于让性别变得更显著
- C（跨场域一致性）：0%=性别表达在不同场合差异很大，100%=性别表达在所有场合高度一致

写作规则：
- 200-300字，中文
- 语气平静、有洞察力，像一个聪明的朋友在观察你们两个人
- 不用破折号堆砌，不用"不是A而是B"排比
- 不做价值判断，不说谁更好谁更差
- 分析每个有显著差异（>20%）的维度会在两人互动中产生什么效果
- 如果某些维度的差异会相互影响，要指出这种交叉效应
- 最后用一句话概括你们之间最核心的互动张力或默契
- 返回纯文本，不要markdown格式`;

  const userMessage = `请分析这两个人之间的互动特征：

人物A「${typeA.nameZh}」(${typeA.code})
分数：S=${scoresA.s}%, R=${scoresA.r}%, D=${scoresA.d}%, C=${scoresA.c}%

人物B「${typeB.nameZh}」(${typeB.code})
分数：S=${scoresB.s}%, R=${scoresB.r}%, D=${scoresB.d}%, C=${scoresB.c}%`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: fallbackText }, { status: 200 });
  }
}
