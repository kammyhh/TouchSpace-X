/**
 * Created by hh on 15/6/29.
 */

var Characteristic = require('./models/characteristic.js');
var Constellation = require('./models/constellation.js');
var Deck = require('./models/deck.js');
var LifeGuardCard = require('./models/life_guard_card.js');
var Period = require('./models/period.js');
var Solution = require('./models/solution.js');

var xlsx = require('node-xlsx');

exports.initDeck = function(req, res) {
  Deck.clean(function () {
    var paths = [
      '/Users/hh/Downloads/cards/♠️.xlsx',
      '/Users/hh/Downloads/cards/❤️.xlsx',
      '/Users/hh/Downloads/cards/♣️.xlsx',
      '/Users/hh/Downloads/cards/♦️.xlsx'
    ];
    for (var n = 0; n < paths.length; n++) {
      var obj = xlsx.parse(paths[n]),
        data = obj[0]['data'];
      for (var i = 1; i < data.length; i++) {
        var record = {};
        if (data[i][0] == '花色') {
          record['card'] = data[i][1];
          record['cards'] = [];
          for (var j = i + 2; j < i + 202; j += 2) {
            var card = {
              age: data[j][0],
              cards: {
                Mercury: [data[j][1], data[j + 1][1]],
                Venus: [data[j][2], data[j + 1][2]],
                Mars: [data[j][3], data[j + 1][3]],
                Jupiter: [data[j][4], data[j + 1][4]],
                Saturn: [data[j][5], data[j + 1][5]],
                Uranus: [data[j][6], data[j + 1][6]],
                Neptune: [data[j][7], data[j + 1][7]],
                long_term: [data[j][8], data[j + 1][8]],
                Pluto: [data[j][9], data[j + 1][9]],
                result: [data[j][10], data[j + 1][10]],
                environment: [data[j][11], data[j + 1][11]],
                substitution: [data[j][12], data[j + 1][12]]
              }
            };
            record['cards'].push(card);
          }
          new Deck(record).save(function (err, record) {
            console.log(record);
          });
        }
      }
    }
    res.send('Deck imported.')
  })
};

exports.initCharacteristic = function(req, res) {
  Characteristic.clean(function () {
    var obj = xlsx.parse('/Users/hh/Downloads/cards/数字性格.xlsx'),
      data = obj[0]['data'];
    for (var i = 0; i < data[0].length; i++) {
      var record = {
        digit: data[0][i],
        characteristic: data[1][i]
      };
      new Characteristic(record).save(function (err, record) {
        console.log(record)
      })
    }
    res.send('数字性格 imported.')
  })
};

exports.initLifeGuardCard = function(req, res) {
  LifeGuardCard.clean(function () {
    var obj = xlsx.parse('/Users/hh/Downloads/cards/生命牌与行星守护牌.xlsx'),
      data = obj[0]['data'];
    for (var i = 0; i < data.length; i++) {
      if (typeof(data[i][0]) == 'number') {
        var record = {
          birthday: data[i][0] * 100 + data[i][1],
          life_card: data[i][2],
          guard_card: data[i][3]
        };
        console.log(record);
        new LifeGuardCard(record).save(function (err, record) {
          console.log(record);
        });
      }
    }
    res.send('生命牌与行星守护牌 imported.')
  })
};

exports.initSolution = function(req, res) {
  Solution.clean(function () {
    var obj = xlsx.parse('/Users/hh/Downloads/cards/牌阵解读20150530.xlsx'),
      data = obj[0]['data'];
    for (var i = 1; i < data.length; i++) {
      var record = {
        card: data[i][0],
        Mercury: data[i][2],
        Venus: data[i][3],
        Mars: data[i][4],
        Jupiter: data[i][5],
        Saturn: data[i][6],
        Uranus: data[i][7],
        Neptune: data[i][8],
        Pluto: data[i][9],
        result: data[i][10],
        long_term: data[i][11],
        environment: data[i][12],
        substitution: data[i][13]
      };
      console.log(record);
      new Solution(record).save(function (err, record) {
        console.log(record);
      });
    }
    res.send('牌阵解读 imported.')
  })
};

exports.initConstellation = function(req, res) {
  Constellation.clean(function () {
    var cons = [
      {
        name: '白羊座',
        intro: '白羊座 Aries',
        duration: '3月21日~4月20日',
        content: '火爆、有行动、充满朝气\n他充满动力、斗志旺盛；他充满热情，随时准备好要出发去行动；对他而言，旅途的过程远比终点更重要。凝重的打击乐和键盘所发出的超强动力， 深深敲击白羊的心灵，发展出一种无止尽的动力和行动，不断向每一段充满活力的音乐推进，唤起白羊满身的活力和热情。这样的音乐才能火力十足的挥洒出这个充满行动力的白羊座。听！音乐里，是白羊们内在力量的根源。'
      }, {
        name: '金牛座',
        intro: '金牛座 Taurus',
        duration: '4月21日~5月21日',
        content: '坚忍、踏实、丰足\n他择善固执，信赖自己的判断力，不易动摇；他坚韧不拔，力可移山；他热爱大自然与优美的事物。弦乐的平和安详，仿佛洒落满怀阳光，舒畅遍体，仿佛阳光照耀在一大片丽美的土地上，充满安定与希望；这样的音乐才能像大地一般，给予金牛座稳定的塌实感。潜心聆听，那是金牛们内敛而又充满毅力的心灵世界。'
      }, {
        name: '双子座',
        intro: '双子座 Gemini',
        duration: '5月22日~6月21日',
        content: '灵活、开朗、能言善道\n他多变不定，而赤巧机敏，他伶牙利齿却容易犹豫。他面貌多端，不断追求体验新的事物。忽快忽慢的旋律，像极了风格多变的双子心灵，这样的音乐才能像速描一般，抓住这个以快速、多变不定闻名的双子座，却又能深入双子的灵魂？ 轻松灵巧的节奏，细细聆听，音乐里是来自双子座心海的声音也是每位双生子最初最真的容颜。'
      }, {
        name: '巨蟹座',
        intro: '巨蟹座 Cancer',
        duration: '6月22日~7月22日',
        content: '含蓄、奉献、幻想\n他敏感又具有同情心，人们常常自动吐露心语给他：念旧、爱家，是个聚财专家，他包容。充满母性，热爱家庭的巨蟹心灵。音乐响起，营造出一份柔软安适的氛围，慢慢的把人包围在一种安全舒适的母性爱之中。这样的音乐才能像潮汐回应着月亮的引力一般，映照出巨蟹座多样的心情变化以及他沉静和谐的内心。用心细听，那是巨蟹们充满接受性的温柔心灵。'
      }, {
        name: '狮子座',
        intro: '狮子座 Leo',
        duration: '7月23日~8月23日',
        content: '慷慨、温暖、公正\n他热爱生命，温暖而力量，他渴望工作，又喜欢些许轻松与安逸；他喜欢人群，并且慷慨赠予一切。一锤击鼓，如耀眼的阳光窜出地平线，不断跃升，一扫所有的阴霾。 音乐雄伟壮丽，如阳光耀眼；丰满的配器，热闹和谐。这样的音乐才能照耀出狮子纯得如金一般耀眼的心灵 。放开胸怀倾听这热爱生命、充满自信的百兽之王，那是来自狮子的内心最温暖的阳光。'
      }, {
        name: '处女座',
        intro: '处女座 Virgo',
        duration: '8月24日~9月22日',
        content: '聪慧、纯结、实际\n他有强烈直觉式的理解能力，他善于分析、追求完美，无论任何事情，只要交到他手上，一定能成功。钢琴规则的节奏，笛声简单柔美的旋律，传达可爱保守的音乐风格，好比室女纤尘不染的心灵。干净、不复杂的配音，音乐主题有秩序的排列。这样的音乐才能契合秩序的室女们心灵深处追求的完美。静心细听，音乐里，是处女们纯净的生命追寻。'
      }, {
        name: '天秤座',
        intro: '天秤座 Libra',
        duration: '9月23日~10月22日',
        content: '优美、和谐、公正\n他举止高雅，是美、爱、和平、光明的化身；他天生具有迷人的魅力，能尽力防止一切纷争；他的灵魂有着艺术感。用钢琴不缓不急的速度行进，悠闲，安祥，营造和谐流畅的乐音，形成了柔美，流畅的线条，充满诗意。这样样的音乐才能彩绘出天秤座均衡和谐的和平世界。静心聆听，音乐里，是天秤们一心追求平衡的优美平和的心灵世界。'
      }, {
        name: '天蝎座',
        duration: '10月23日~11月21日',
        content: '蜕变、超越、更新\n他的眼神坚定锐利，刺入别人的灵魂，他无惧一切，自信能克服一切打击，他充满活力，追根究底，蜕变再蜕变。音乐充满神秘力量，旋律逐渐深入发展、攀向更新的层次，渐深渐广，层次鲜活多变，峰回路转，有柳暗花明又一春的开阔心境。这样的音乐才能深入天蝎座，不断蜕变的深层灵魂。静心聆听，那是天蝎们潜藏的生命力量。'
      }, {
        name: '射手座',
        intro: '射手座 Sagittarius',
        duration: '11月22日~12月21日',
        content: '脱俗、独立、真诚\n他向往远方，追求真理；他真诚，负责，心胸宽大；旅程中，他燃起脱俗而具创意的火花，照亮了暗处。天性负责、真诚，爱好自由的射手，永不放弃追寻性灵上的领悟与成长。充满着节奏动感的打击乐，如同马蹄般连续不断的行进，引领着射手的蹄声。一如射手追求圆满而永恒的真理。这样的音乐才能铺展出射手座不断前进的旅程。听！音乐里，是射手们内心最深层的向往。'
      }, {
        name: '摩羯座',
        intro: '魔羯座 Capricom',
        duration: '12月22日~1月20日',
        content: '自制、严肃、理智\n他严以律己，总是散发出一种忧虑严肃的气息；他忍辱负重，适应时机，能获得最后的胜利；他的潜力不可计量。沉稳有力的低频带动简明的旋律，缓步向前行进，渐深渐沉；音乐以简单的配器、和缓的速度，慢慢的，慢慢的，走进一个属于摩羯心思清明的世界。这样的音乐才能打开魔羯座深藏在忧虑、孤寂中的心灵。静静听来，音乐里是魔羯们不断向前攀爬、自我试练的灵魂。'
      }, {
        name: '水瓶座',
        intro: '水瓶座 Aquarius',
        duration: '1月21日~2月19日',
        content: '改革、独立、友善\n他的双眼潜藏了某种别人无法洞悉的玄秘，他热烈追求友谊，却又要给自己一片孤独的天空；他是天生的叛徒。水瓶一心一意想摆脱各种束缚，寻觅自由的心灵世界。活泼的节奏、特殊的主旋律、平易近人的音乐语汇，有如不受拘束的云与风，自由自在的飞翔於天空和原野。这样的音乐才能满足水瓶座内心深处对自由与创新的追求。听！音乐里，是水瓶们自在遨游的心灵追求。'
      }, {
        name: '双鱼座',
        intro: '双鱼座 Pisces',
        duration: '2月20日~3月20日',
        content: '直觉、敏锐、易感\n他如同水中遨游的鱼儿，悠闲，清爽，浪漫，他与人类灵魂的最终处深深相连；他行出的直觉引导人们远离孤独寂寞。温柔纤细、自我牺牲、富想像力的双鱼。在钢琴演奏中，思绪渐渐沉静。随性又浪漫的旋律，朦胧的音乐营造出一种神秘，空灵的色彩，越过真实的世界，飞向梦幻之中。这样的音乐才能带给双鱼座如水的漫柔世界。听！音乐里，漫游在双鱼易感、无私、透明的心灵世界。'
      }
    ];
    //var cons = [
    //  {
    //    name: '白羊座',
    //    duration: '3月21日~4月20日',
    //    content: '白羊座代表着万物生长的开端，是自然的根本。追求自我，最纯粹的境界我故我存在。他们活力十足天赋异禀，极富动感爱冒险常怀着敬畏好奇之心去认知探索世界，直白坦诚常像孩子一样以自我为中心，追求新奇，希望能引起别人的注意，认可自己的价值。经常表露出强烈的领导欲望，认定的事一定会坚持到底，他们十分渴望成为人群中最耀眼的光芒。'
    //  }, {
    //    name: '金牛座',
    //    duration: '4月21日~5月21日',
    //    content: '金牛座代表着成长和发展，和谐稳定是他们的生活态度。固执不喜欢变化，热衷于将身边的环境改造的更美好，为所爱的人而生活。他们喜欢成为团队中的一员，习惯忍耐，当发生问题是，会先保护自己的利益。对周围的物质世界充满好奇，他们会当敏锐的观察者能细致的筹划一个活动，待机而动。他们有艺术细胞，具有高度欣赏任何艺术的品味。'
    //  }, {
    //    name: '双子座',
    //    duration: '5月22日~6月21日',
    //    content: '双子座代表着敏捷的思维和随和交流能力。不愿意墨守成规，喜欢千变万化带来的满足感。直言不讳，陶醉自己的张扬个性，喜欢刺激的生活，害怕无聊重复单一。勇于冒险，创新哪怕带来麻烦也会让自己高兴，这样会让生活变得丰富多彩。喜欢结伴而行对自我有提升的活动感兴趣，专注力不稳定，容易半途而废。追求自由，享受改变想法的过程。'
    //  }, {
    //    name: '巨蟹座',
    //    duration: '6月22日~7月22日',
    //    content: '巨蟹座代表着深刻的情感，保护力，家庭责任。情感细腻，重视家庭，对人有一定的防御性，不会直接提出要求，通常习惯让别人感受自己的情感变化。看重友谊带来的感情共鸣，享受彼此分享彼此信任带来的心里满足。喜欢在私人空间感受美好的一切，总能在定期的家人活动中获得心灵上的放松。对于要得到的变得有侵略性一定会坚持到底，不言放弃。'
    //  }, {
    //    name: '狮子座',
    //    duration: '7月23日~8月23日',
    //    content: '狮子座代表着万丈光芒集于一身的王者风范，有野心，自信，力量是这个星座的特点，他们希望通过强势直接的行动去领导他人，让他人服从。温暖，正直不容任何不公正，压迫的事发生，一旦发生会立刻对抗。他们慷慨，付出时会竭尽全力，忠于自己的家庭，朋友，伴侣照顾每个人的感受，希望自己能给人一种值得信赖的形象。'
    //  }, {
    //    name: '处女座',
    //    duration: '8月24日~9月22日',
    //    content: '处女座代表着生命需要一个有序严谨的方法来看到世界，做事严谨周密，有强力的求知欲。有旺盛的批判精神，自己追求事事完美而对他人有所挑剔。凡事喜欢保密，容易相信表面想象，他们的内心世界被分析、破解、衡量所占据。他们喜欢深思熟虑计划好一切再做出行动。因性格内对来自向外部的压力常采取消极回避的方式。'
    //  }, {
    //    name: '天秤座',
    //    duration: '9月23日~10月22日',
    //    content: '天秤座代表生命对平衡的需求。追求一切美的事物，执着公平的对待每个人。感性，体贴，有极佳的口才，是个很好的朋友能为他人着想，容易被美丽的外表所吸引，不喜欢别人的催促，时刻都要衡量每一点的平衡，常有拖延症。慷慨热情，却总无法避免在追求平等的过程中为保持中立而惹来自尊上的伤害。'
    //  }, {
    //    name: '天蝎座',
    //    duration: '10月23日~11月21日',
    //    content: '天蝎座代表着生命中强大的引导力量和掌控人生的能力。争强好胜，有强烈的防御性通常不主动与他人发生冲突，习惯凭着直觉行动，对身边的一切都想争取主导力量，强势不妥协，心怀坚定的目标，站得高看得远，有能屈能伸的能力，对待严肃性的事也能有自己成熟的看法，不盲目乐观，通过自己的幽默感自我解嘲面对一切苦难。'
    //  }, {
    //    name: '射手座',
    //    duration: '11月22日~12月21日',
    //    content: '射手座代表着生命中把控世界观的能力，心胸开阔，乐观，不拘小节。崇尚自由自在的生活，是个享乐主义者，他们率真，有感染他人的生命力，对探索周边的世界有强烈的热情，不断地寻找新方式表达自己，他们热爱运动，希望找到自己的节奏。他们始终在追求属于自己的生活环境，不会轻言放弃自己的希望和理想。'
    //  }, {
    //    name: '摩羯座',
    //    duration: '12月22日~1月20日',
    //    content: '摩羯座代表着生命中成熟的需求。他们节约，做事严谨，有强烈的责任感。常通过耐心持之以恒来完成目标，对容易达成的事持怀疑态度。常怀有远大的抱负，但内心比较内向忧郁，欠缺幽默感，常会用严厉的外表掩饰内心的消极。守旧派能顺势接受命运的安排，缺少改变的灵活性。是天生的权利追逐者，有独裁倾向。'
    //  }, {
    //    name: '水瓶座',
    //    duration: '1月21日~2月19日',
    //    content: '水瓶座代表着生命中的科学价值和超感能量。他们是理想主义者，爱好和平，以开放的心态接纳一切。推崇崇高的理想，富有创造性聪慧，能平等客观的对待周边的人。善变，喜欢打破常规发挥自己的潜能，敞开心怀时，对拒绝不能接受，但能坚持自己的立场，坚信世间自有公道，容易陷入莫名的人性黑暗面。'
    //  }, {
    //    name: '双鱼座',
    //    duration: '2月20日~3月20日',
    //    content: '双鱼座代表着生命中摆脱尘世负担和宇宙融为一体的精神。梦幻、单纯、敏感、乐于人分享的是他们的特质，他们极度敏感，富有较强的观察力但总会举棋不定，缺乏自信，又富有强烈的同情心，对周遭不公的事总会表现出怜悯心。他们随遇而安，对不幸的事也总能坦然接受。是天生的艺术天才，喜欢沉醉在浪漫的世界。'
    //  }
    //];
    for (var i = 0; i < cons.length; i++) {
      var record = cons[i];
      console.log(record);
      new Constellation(record).save(function (err, record) {
        console.log(record['name'] + ':' + record['content'].length)
      });
    }
    res.send('星座解释 imported.')
  })
};

exports.initPeriod = function(req, res) {
  Period.clean(function () {
    var obj = xlsx.parse('/Users/hh/Downloads/cards/period.xlsx'),
      data = obj[0]['data'];
    for (var i = 0; i < data.length; i++) {
      var record = {
        date: data[i][0],
        p1: data[i][1],
        p2: data[i][2],
        p3: data[i][3],
        p4: data[i][4],
        p5: data[i][5],
        p6: data[i][6],
        p7: data[i][7]
      };
      new Period(record).save(function (err, record) {
        console.log(record);
      });
    }
    res.send('Periods imported.')
  })
};

