import { NextRequest, NextResponse } from "next/server";

const fallbackText =
  "两个不同的棱镜折射出不同的光。你们之间的互动模式很难被简单概括，但差异本身就是对话的起点。";

export async function POST(req: NextRequest) {
  const { typeA, typeB, scoresA, scoresB, scoresApproximate } = await req.json();

  const systemPrompt = `你是 Gender Prism 的互动分析师。根据两个人的性别互动模式生成一段简短的互动分析。

四个维度：
- S（性别感知强度）：0%=几乎不按性别分类世界，100%=高度按性别组织信息
- R（反思程度）：0%=觉得一切自然不需分析，100%=能清楚看到性别规范在运作
- D（方向）：0%=让性别在互动中变淡，100%=让性别在互动中变浓
- C（一致性）：0%=不同场合差异大，100%=所有场合高度一致

写作规则：
- 120-180字，中文，三到四段
- 第一段写你们最核心的一个差异或相似，一两句话点到
- 第二段写这个差异在日常互动中会怎样体现
- 第三段用一句话收尾，概括你们之间的关系质感
- 语气像一个观察力很好的朋友在随口说的话，平静、有洞察但不说教
- 不要提具体的百分比数字
- 不用破折号
- 不用"不是A而是B"的句式
- 不用"维度""框架""图式""耦合"等学术词汇
- 不做价值判断，不说谁好谁差
- 如果分数是手动回忆的（user message 会注明），不要过度解读细微差异`;

  let userMessage = `请分析这两个人之间的互动特征：

人物A「${typeA.nameZh}」(${typeA.code})
分数：S=${scoresA.s}%, R=${scoresA.r}%, D=${scoresA.d}%, C=${scoresA.c}%

人物B「${typeB.nameZh}」(${typeB.code})
分数：S=${scoresB.s}%, R=${scoresB.r}%, D=${scoresB.d}%, C=${scoresB.c}%`;

  if (scoresApproximate) {
    userMessage +=
      "\n\n注意：人物A的分数是手动回忆填写的，可能不完全精确，分析时避免过度依赖具体数字的差异。";
  }

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
        max_tokens: 400,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: fallbackText }, { status: 200 });
  }
}
