export type QuestionDimension = "S" | "R" | "D" | "C";
export type QuestionTier = "U" | "D" | "X";

export type Question = {
  id: number;
  dimension: QuestionDimension;
  text: string;
  primaryWeight: number;
  secondaryDimension?: QuestionDimension;
  secondaryWeight?: number;
  reverse: boolean;
  tier: QuestionTier;
};

export const likertOptions = [
  { value: 1, label: "完全不符合" },
  { value: 2, label: "比较不符合" },
  { value: 3, label: "不确定" },
  { value: 4, label: "比较符合" },
  { value: 5, label: "完全符合" },
] as const;

export const questionDisplayOrder = [
  19, 55, 1, 37, 20, 56, 2, 38, 23, 57, 5, 39, 24, 58, 6, 40, 27,
  59, 8, 42, 28, 60, 9, 43, 30, 61, 12, 44, 31, 62, 13, 46, 32, 63,
  14, 47, 34, 64, 16, 48, 35, 65, 17, 49, 36, 66, 18, 50, 21, 3, 51,
  22, 4, 52, 25, 7, 53, 26, 10, 54, 29, 11, 41, 33, 15, 45,
] as const;

export const questions: Question[] = [
  { id: 1, dimension: "S", text: "当有人提到一个你不认识的人时，你会比较想先知道对方的性别。", primaryWeight: 1.0, reverse: false, tier: "U" },
  { id: 2, dimension: "S", text: "你进入一个新的社交场合时，会比较快地注意到在场者的性别构成。", primaryWeight: 0.8, reverse: false, tier: "U" },
  { id: 3, dimension: "S", text: "在描述一个人时，你通常会在比较早的时候提到对方的性别。", primaryWeight: 1.0, reverse: false, tier: "U" },
  { id: 4, dimension: "S", text: "在和别人相处时，你会比较自然地做出一些像男生/女生的举动。", primaryWeight: 0.8, secondaryDimension: "R", secondaryWeight: 0.3, reverse: false, tier: "D" },
  { id: 5, dimension: "S", text: "当一个人的行为不太符合其性别的常见模式时，你会注意到这一点。", primaryWeight: 1.0, reverse: false, tier: "D" },
  { id: 6, dimension: "S", text: "你觉得男性和女性在性格或做事方式上，确实有比较明显的不同。", primaryWeight: 0.8, reverse: false, tier: "U" },
  { id: 7, dimension: "S", text: "你会对不同性别的朋友聊不同的话题，或者用不同的方式聊同一个话题。", primaryWeight: 0.6, reverse: false, tier: "D" },
  { id: 8, dimension: "S", text: "当别人用\"作为一个男人/女人\"来解释某个行为时，你通常觉得这个解释没什么说服力。", primaryWeight: 1.0, reverse: true, tier: "U" },
  { id: 9, dimension: "S", text: "在选择电影、书籍或播客时，主角或创作者的性别会影响你的选择。", primaryWeight: 0.8, reverse: false, tier: "D" },
  { id: 10, dimension: "S", text: "你在社交中比较自然地倾向于和同性别的人建立更深的连接。", primaryWeight: 0.6, secondaryDimension: "D", secondaryWeight: 0.3, reverse: false, tier: "D" },
  { id: 11, dimension: "S", text: "如果有人不告诉你他们的性别，你不会觉得缺少了什么重要信息。", primaryWeight: 1.0, reverse: true, tier: "U" },
  { id: 12, dimension: "S", text: "你会用性别来预测一个人可能的兴趣、反应方式或价值观。", primaryWeight: 0.8, reverse: false, tier: "D" },
  { id: 13, dimension: "S", text: "你对自己的穿着打扮有一个比较明确的\"适合我这个性别\"的边界。", primaryWeight: 0.6, secondaryDimension: "C", secondaryWeight: 0.3, reverse: false, tier: "D" },
  { id: 14, dimension: "S", text: "在评价一个人的行为时，你有时候会在心里默认加上\"作为一个男人/女人来说\"这个前缀。", primaryWeight: 1.0, reverse: false, tier: "U" },
  { id: 15, dimension: "S", text: "你很少会用\"这很男性化\"或\"这很女性化\"来形容一种品质或行为。", primaryWeight: 0.8, reverse: true, tier: "U" },
  { id: 16, dimension: "S", text: "你对某些职业、爱好或行为有一个直觉上的\"这更常见于某个性别\"的判断。", primaryWeight: 0.6, reverse: false, tier: "D" },
  { id: 17, dimension: "S", text: "你在评估一段关系（友情、爱情、工作关系）时，性别动态是你会考虑的因素之一。", primaryWeight: 0.8, secondaryDimension: "R", secondaryWeight: 0.3, reverse: false, tier: "D" },
  { id: 18, dimension: "S", text: "一个人的性别对你来说是关于他们最不有趣的信息之一。", primaryWeight: 1.0, reverse: true, tier: "U" },
  { id: 19, dimension: "R", text: "你能比较清楚地说出，在你的成长环境中，社会对你这个性别有哪些具体的期待。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 20, dimension: "R", text: "你做过一些事情，事后想想，与其说是自己真心想做，不如说是觉得“我这个性别好像就该这样”。", primaryWeight: 0.8, reverse: false, tier: "X" },
  { id: 21, dimension: "R", text: "你有时候能看出来，周围一些人的言行明显被“男生/女生应该怎样”约束着。", primaryWeight: 1.0, secondaryDimension: "S", secondaryWeight: 0.3, reverse: false, tier: "X" },
  { id: 22, dimension: "R", text: "在你看来，大部分日常交往跟谁是男谁是女没什么关系。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 23, dimension: "R", text: "你身上的某些习惯或偏好，你分得清哪些是自己选的，哪些是从小被“应该这样”的说法塑造出来的。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 24, dimension: "R", text: "你有时候会观察到：同样的行为在不同性别的人身上会被给予不同的评价。", primaryWeight: 0.6, reverse: false, tier: "X" },
  { id: 25, dimension: "R", text: "你会注意到广告、影视或日常语言中的性别暗示。", primaryWeight: 0.8, secondaryDimension: "D", secondaryWeight: 0.3, reverse: false, tier: "X" },
  { id: 26, dimension: "R", text: "你觉得\"性别不平等\"更多是一个历史问题，在你的日常生活中不太感受得到。", primaryWeight: 1.0, reverse: true, tier: "X" },
  { id: 27, dimension: "R", text: "你能意识到自己在不同场合会调整表达方式，让自己更符合别人对你性别的期待。", primaryWeight: 0.8, reverse: false, tier: "X" },
  { id: 28, dimension: "R", text: "你和朋友或伴侣讨论过\"性别如何影响了我们\"这类话题。", primaryWeight: 0.6, reverse: false, tier: "X" },
  { id: 29, dimension: "R", text: "你觉得大多数人对性别的行为反应是自然的、本能的，不需要过多分析。", primaryWeight: 1.0, reverse: true, tier: "X" },
  { id: 30, dimension: "R", text: "你有时会想：如果你是另一个性别，你的人生轨迹会有显著不同。", primaryWeight: 0.8, reverse: false, tier: "X" },
  { id: 31, dimension: "R", text: "关于男生/女生应该怎样，有很多不成文的规矩。你能把它们说出来。", primaryWeight: 0.6, secondaryDimension: "S", secondaryWeight: 0.3, reverse: false, tier: "X" },
  { id: 32, dimension: "R", text: "你有过这样一个瞬间：突然意识到某件你一直觉得天经地义的事，其实只是因为社会对不同性别有不同的期待。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 33, dimension: "R", text: "你不太理解为什么有些人那么关注性别议题——在你看来，这些议题被过度放大了。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 34, dimension: "R", text: "当你听到\"男人就应该/女人就应该\"这类话时，你的第一反应是质疑这个前提。", primaryWeight: 0.6, secondaryDimension: "D", secondaryWeight: 0.4, reverse: false, tier: "X" },
  { id: 35, dimension: "R", text: "你能意识到性别规范不只是\"别人\"强加的，你自己有时候也在（有意或无意地）执行和传递它。", primaryWeight: 0.8, reverse: false, tier: "X" },
  { id: 36, dimension: "R", text: "你觉得自己对性别的理解跟小时候基本没变——没什么需要重新思考的。", primaryWeight: 1.0, reverse: true, tier: "X" },
  { id: 37, dimension: "D", text: "在你参与的对话和互动中，性别作为话题或参考框架经常被提起。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 38, dimension: "D", text: "你倾向于强调而非弱化不同性别之间的差异——你觉得差异是真实的、有意义的。", primaryWeight: 0.8, reverse: false, tier: "X" },
  { id: 39, dimension: "D", text: "你更希望别人把你当作一个\"人\"来对待，而不是首先当作一个\"男人/女人\"来对待。", primaryWeight: 1.0, reverse: true, tier: "X" },
  { id: 40, dimension: "D", text: "你在社交中会比较自然地做出一些强调你性别身份的行为。", primaryWeight: 0.8, secondaryDimension: "S", secondaryWeight: 0.3, reverse: false, tier: "X" },
  { id: 41, dimension: "D", text: "你倾向于避免把问题归结为性别问题——你觉得大多数事情的原因比性别更复杂。", primaryWeight: 1.0, reverse: true, tier: "X" },
  { id: 42, dimension: "D", text: "你觉得男女之间的不同是有意义的、值得被认真对待的。", primaryWeight: 0.8, reverse: false, tier: "X" },
  { id: 43, dimension: "D", text: "当你发现某个空间或活动是按性别划分的，你的第一反应是觉得没必要。", primaryWeight: 0.6, secondaryDimension: "R", secondaryWeight: 0.3, reverse: true, tier: "X" },
  { id: 44, dimension: "D", text: "你觉得“我的性别”是别人理解你这个人时比较重要的一条信息。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 45, dimension: "D", text: "你更倾向于在混合性别的环境中活动，而不是单一性别的环境。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 46, dimension: "D", text: "你会用性别来解释或理解人际冲突。", primaryWeight: 0.6, reverse: false, tier: "X" },
  { id: 47, dimension: "D", text: "你理想中的世界里，大多数时候人们不太需要关心谁是男谁是女。", primaryWeight: 1.0, reverse: true, tier: "X" },
  { id: 48, dimension: "D", text: "你对自己的性别表达有一种自豪感——你喜欢展现你性别身份中让你感到有力量的部分。", primaryWeight: 0.8, secondaryDimension: "C", secondaryWeight: 0.3, reverse: false, tier: "X" },
  { id: 49, dimension: "D", text: "你在着装、发型、行为方式上刻意地不去配合人们对你性别的期待。", primaryWeight: 0.6, reverse: true, tier: "X" },
  { id: 50, dimension: "D", text: "你觉得性别是理解人类经验的一个核心维度——如果抹去性别，我们会失去一些重要的东西。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 51, dimension: "D", text: "当有人强调性别差异时，你通常想指出：个体差异远大于性别差异。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 52, dimension: "D", text: "你在养育或教育中（如果适用），会比较注意传递与性别相关的价值观和行为模式。", primaryWeight: 0.6, secondaryDimension: "S", secondaryWeight: 0.4, reverse: false, tier: "X" },
  { id: 53, dimension: "D", text: "你倾向于用性别中性的方式说话和互动。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 54, dimension: "D", text: "你觉得你的性别身份是你自我表达的一个重要资源，而不是一个限制。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 55, dimension: "C", text: "在某些场合你会收着自己身上的某些性别特质，在另一些场合会放开。", primaryWeight: 1.0, reverse: true, tier: "X" },
  { id: 56, dimension: "C", text: "在不同场合里，你的穿着打扮和说话方式给人的性别印象通常比较一致。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 57, dimension: "C", text: "你在家人面前和在朋友面前，表现出的男性化或女性化程度差别比较大。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 58, dimension: "C", text: "你有时候会根据在场的人是男是女，来调整自己的表现方式。", primaryWeight: 0.8, secondaryDimension: "S", secondaryWeight: 0.3, reverse: true, tier: "X" },
  { id: 59, dimension: "C", text: "你在社交媒体上呈现的自己，和朋友在现实中认识的你，在性别气质上差别比较大。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 60, dimension: "C", text: "认识你的人，不管是从哪个场合认识你的，对你的“气质”描述会非常一致。", primaryWeight: 1.0, reverse: false, tier: "X" },
  { id: 61, dimension: "C", text: "你在恋爱关系中的表现，和你跟普通朋友在一起时相比，在性别气质上有明显不同。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 62, dimension: "C", text: "你在父母或长辈面前，会比平时更多地表现出符合他们期待的性别形象。", primaryWeight: 0.8, secondaryDimension: "R", secondaryWeight: 0.3, reverse: true, tier: "X" },
  { id: 63, dimension: "C", text: "你在工作或学校里的状态，和你私下跟亲近的人在一起时，在性别气质上差别比较大。", primaryWeight: 0.8, reverse: true, tier: "X" },
  { id: 64, dimension: "C", text: "你能感觉到，不同的场合对你“应该怎么表现自己的性别”有不同的期待。", primaryWeight: 0.6, reverse: true, tier: "X" },
  { id: 65, dimension: "C", text: "你的性别表达在不同人生阶段有过比较显著的变化。", primaryWeight: 0.6, reverse: true, tier: "X" },
  { id: 66, dimension: "C", text: "如果回看五年前的自己，你在性别表达上和现在差别比较大。", primaryWeight: 0.6, secondaryDimension: "D", secondaryWeight: 0.3, reverse: true, tier: "X" },
];

const questionById = new Map(questions.map((question) => [question.id, question]));

export const orderedQuestions = questionDisplayOrder.map((id) => {
  const question = questionById.get(id);

  if (!question) {
    throw new Error(`Missing question with id ${id}`);
  }

  return question;
});
