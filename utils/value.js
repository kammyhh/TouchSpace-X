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

exports.exp_addition = {
  'attend': 10,
  'six': 30,
  'invite': 100,
  'accept': 20,
  'assist': 40
};

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
    reply: '人们之间的联系千丝万缕，且不受时间空间的限制。如果我们的命运有一道公式，如果所谓的巧合是计算出来的，如果有一天你突然知道，为什么70亿人，我会与他们相遇。不用惊讶，这就是我们现在正在做的事，探索隐藏于星象学中的数列关系，去寻找人与人，人与事，事与事之间的必然关联。回复你的生日（ps：19800512），我们会告诉你很多，很多。'
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

exports.default_token = 'empty';

exports.empty_device_token = '1';

exports.identity_limit = 30; //mins

exports.bind_limit = 1; //days

var deck_intro = '1、每个人都有两张伴随其一生的牌，从出生那天起这两张牌所赋予的智慧与情感就融于每个人的命运之中。其中一张牌叫做【生命牌】，是我们每个人的灵魂特征，也是最重要的一张牌；另外一张叫【行星守护牌】，是我们每个人生活中的特征表现，仅次于生命牌。（本版中我们不对两张牌做详细解释。)\n'
  + '2、【生命牌】与【行星守护牌】从0-99岁，都有一套完整的牌阵，每年的牌阵都不相同。每个牌阵又分7个行星周期（水星、金星、火星、木星、土星、 天王星、海王星），每个行星周期到下个行星周期的天数为52天，7个周期为52*7=364天，构成一整年（12月31日出生的人，没有行星周期，但这天出生的人，生命牌可以是任意一张。）每个行星周期周期对应1或者2张牌，每张行星周期牌都有不同的解释，告诉你这个周期你需要面对哪些重要的事情。\n'
  + '3、每个人的行星周期从水星开始，到海王星结束一整年。水星的起始日期是每个人的生日当天，海王星的结束日期是下个生日的前一天。并非我们通常认为的从1月1日到12月31日。\n'
  + '4、除此之外，每年的牌阵中，还会有影响这一整年的5张牌，分别为【年度牌】【挑战牌】【结果牌】【祝福牌】【努力牌】，详细牌阵中会有其相关解释。\n';

exports.deck_intro = deck_intro;

exports.content_in_profile = deck_intro  + '5、以下是你自己的行星周期列表:\n';

exports.email_transporter = {
  address: 'TouchSpace-X <noreply@touchspacex.com>',
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@touchspacex.com',
    pass: 'DyE-m3T-vUD-MfZ'
  }
};