/**
 * Created by hh on 15/8/19.
 */

exports.constellation_division = {
  双鱼座: {
    start: 332,
    range: 28
  },
  白羊座: {
    start: 0,
    range: 19
  },
  金牛座: {
    start: 29,
    range: 27
  },
  双子座: {
    start: 63,
    range: 29
  },
  巨蟹座: {
    start: 106,
    range: 18
  },
  狮子座: {
    start: 124,
    range: 25
  },
  处女座: {
    start: 149,
    range: 43
  },
  天秤座: {
    start: 192,
    range: 14
  },
  天蝎座: {
    start: 212,
    range: 24
  },
  射手座: {
    start: 247,
    range: 11
  },
  摩羯座: {
    start: 267,
    range: 30
  },
  水瓶座: {
    start: 302,
    range: 30
  }
};

exports.suit_character_to_letter = {
  '黑': 'A',   //黑桃
  '红': 'B',   //红桃
  '草': 'C',   //草花
  '方': 'D'    //方块
};

exports.digit_pair = {
  1: 2,
  2: 8,
  3: 6,
  4: 7,
  5: 4,
  6: 3,
  7: 9,
  8: 5,
  9: 1
};

exports.period_digit_to_en = {
  1: 'Mercury',
  2: 'Venus',
  3: 'Mars',
  4: 'Jupiter',
  5: 'Saturn',
  6: 'Uranus',
  7: 'Neptune'
};

exports.period_en_to_cn = {
  Mercury: '水星',
  Venus: '金星',
  Mars: '火星',
  Jupiter: '木星',
  Saturn: '土星',
  Uranus: '天王星',
  Neptune: '海王星'
};

exports.level = [
  100,
  140,
  200,
  275,
  385,
  540,
  750,
  1055,
  1475,
  2065,
  2890,
  4050,
  5670
];

exports.future_periods_of_level = {
  1: 1,
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 4,
  10: 5,
  11: 6,
  12: 7,
  13: 7,
  14: 7
};

exports.song_cost_of_level = {
  1: 2,
  2: 2,
  3: 2,
  4: 2,
  5: 2,
  6: 2,
  7: 1.5,
  8: 1.5,
  9: 1,
  10: 0.5,
  11: 0.5,
  12: 0
};

exports.target_list = [
  "55d42aaa67e4c9aa04d204b4",
  "55d42a8967e4c9aa04d204b2",
  "55d42a7c67e4c9aa04d204b1",
  "55d42a7467e4c9aa04d204b0",
  "55d42a6c67e4c9aa04d204af"
];

exports.auto_reply_list = [
  {
    keyword: 'subscribe',
    reply: '人们之间的联系千丝万缕，且不受时间空间的限制。如果我们的命运有一道公式，如果所谓的巧合是计算出来的，如果有一天你突然知道，为什么70亿人，我会与他们相遇。不用惊讶，这就是我们现在正在做的事，探索隐藏于星象学中的数列关系，去寻找人与人之，人与事，事与事之间的必然关联。回复你的生日（ps：19800512），我们会告诉你很多，很多。'
  },
  //{
  //  keyword: '关键字',
  //  reply: '自动回复'
  //},
  //{
  //  keyword: '关键字',
  //  reply: '自动回复'
  //},
  //{
  //  keyword: '关键字',
  //  reply: '自动回复'
  //},
  //{
  //  keyword: '关键字',
  //  reply: '自动回复'
  //},
  {
    keyword: '关键字',
    reply: '自动回复'
  }
];