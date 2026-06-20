export type TypeQuote = {
  original: string;
  translation?: string;
  source: string;
};

export const typeQuotes: Record<string, TypeQuote> = {
  TRGL: {
    original: "“知止而后有定，定而后能静。”",
    source: "——《大学》",
  },
  TRGM: {
    original: "“天下之至柔，驰骋天下之至坚。”",
    source: "——《道德经》第四十三章",
  },
  TRFL: {
    original: '"This above all: to thine own self be true."',
    translation: "“最重要的是：对你自己真诚。”",
    source: "—— Shakespeare, Hamlet",
  },
  TRFM: {
    original: "“上善若水。水善利万物而不争。”",
    source: "——《道德经》第八章",
  },
  TDGL: {
    original: "“曲则全，枉则直。”",
    source: "——《道德经》第二十二章",
  },
  TDGM: {
    original: '"I am large, I contain multitudes."',
    translation: "“我辽阔，我包含万象。”",
    source: "—— Walt Whitman, Song of Myself",
  },
  TDFL: {
    original: '"Here I stand. I can do no other."',
    translation: "“我站在这里，别无他择。”",
    source: "—— Martin Luther",
  },
  TDFM: {
    original: '"Not all those who wander are lost."',
    translation: "“并非所有漫游者都迷失了方向。”",
    source: "—— J.R.R. Tolkien",
  },
  WRGL: {
    original: "“独乐乐，不如众乐乐。”",
    source: "——《孟子·梁惠王下》",
  },
  WRGM: {
    original: "“人生如逆旅，我亦是行人。”",
    source: "—— 苏轼《临江仙》",
  },
  WRFL: {
    original: '"No one is free until we are all free."',
    translation: "“没有人是自由的，除非所有人都自由。”",
    source: "—— bell hooks",
  },
  WRFM: {
    original: "“子在川上曰：逝者如斯夫，不舍昼夜。”",
    source: "——《论语·子罕》",
  },
  WDGL: {
    original: '"What is essential is invisible to the eye."',
    translation: "“真正重要的东西，眼睛是看不见的。”",
    source: "—— Antoine de Saint-Exupéry",
  },
  WDGM: {
    original: "“行到水穷处，坐看云起时。”",
    source: "—— 王维《终南别业》",
  },
  WDFL: {
    original: '"The personal is political."',
    translation: "“个人的即政治的。”",
    source: "—— Carol Hanisch",
  },
  WDFM: {
    original: '"One is not born, but rather becomes, a woman."',
    translation: "“女人不是天生的，而是后天形成的。”",
    source: "—— Simone de Beauvoir",
  },
  HIDDEN_DRIFT: {
    original: "“知不知，尚矣；不知知，病也。”",
    source: "——《道德经》第七十一章",
  },
  HIDDEN_TWILIGHT: {
    original:
      '"The real voyage of discovery consists not in seeking new landscapes, but in having new eyes."',
    translation:
      "“真正的发现之旅不在于寻找新风景，而在于拥有新的眼睛。”",
    source: "—— Marcel Proust",
  },
  HIDDEN_SMOKE: {
    original: "“雾失楼台，月迷津渡。”",
    source: "—— 秦观《踏莎行》",
  },
  HIDDEN_DEW: {
    original: "“朝闻道，夕死可矣。”",
    source: "——《论语·里仁》",
  },
  HIDDEN_RIDGE: {
    original: '"Do I contradict myself? Very well then I contradict myself."',
    translation: "“我自相矛盾吗？那就自相矛盾好了。”",
    source: "—— Walt Whitman, Song of Myself",
  },
};

export function getTypeQuote(code: string): TypeQuote | null {
  return typeQuotes[code] ?? null;
}

export function formatTypeQuoteForCopy(quote: TypeQuote): string {
  return [quote.original, quote.translation, quote.source]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export function getTypeQuotePreview(quote: TypeQuote): string {
  return quote.translation ?? quote.original;
}
