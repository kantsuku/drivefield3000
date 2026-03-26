# -*- coding: utf-8 -*-
import json

existing = json.load(open('src/data/diagnosis-questions.json', encoding='utf-8'))

new_qs = [
    # 自己肯定感（8問）
    {"id": "SE01", "type": "2択", "domain": "自己肯定", "question": "新しい服を買った日、人に会いたくなるか", "choices": [{"id": "A", "text": "会いたくなる。見てもらいたい気持ちが自然に湧く", "score": {"self_esteem": 3}}, {"id": "B", "text": "特に変わらない。服と自分の気分はあまり連動しない", "score": {"self_esteem": -1}}]},
    {"id": "SE02", "type": "2択", "domain": "自己肯定", "question": "「あなたの得意なことは？」と聞かれたら", "choices": [{"id": "A", "text": "すぐに3つ以上は言える", "score": {"self_esteem": 3}}, {"id": "B", "text": "うーん、と考え込んでしまう", "score": {"self_esteem": -3}}]},
    {"id": "SE03", "type": "2択", "domain": "自己肯定", "question": "自分がいなくなったら困る人がいると思うか", "choices": [{"id": "A", "text": "いると思う。具体的な顔が浮かぶ", "score": {"self_esteem": 3}}, {"id": "B", "text": "正直、あまり自信がない", "score": {"self_esteem": -3}}]},
    {"id": "SE04", "type": "2択", "domain": "自己肯定", "question": "やったことないことに誘われたとき、最初に浮かぶのは", "choices": [{"id": "A", "text": "面白そう、やってみたい", "score": {"self_esteem": 2, "D": 1}}, {"id": "B", "text": "自分にできるかな、失敗したらどうしよう", "score": {"self_esteem": -3}}]},
    {"id": "SE05", "type": "2択", "domain": "自己肯定", "question": "失敗した翌日、どちらに近いか", "choices": [{"id": "A", "text": "凹むけど動ける。次のことを考え始めている", "score": {"self_esteem": 2}}, {"id": "B", "text": "しばらく引きずる。動き出すまでに時間がかかる", "score": {"self_esteem": -2}}]},
    {"id": "SE06", "type": "2択", "domain": "自己肯定", "question": "写真を撮られるのは", "choices": [{"id": "A", "text": "別に平気。自然体でいられる", "score": {"self_esteem": 2}}, {"id": "B", "text": "できれば避けたい。写りを気にしてしまう", "score": {"self_esteem": -2}}]},
    {"id": "SE07", "type": "2択", "domain": "自己肯定", "question": "人から褒められたとき", "choices": [{"id": "A", "text": "素直に嬉しい。ありがとうと言える", "score": {"self_esteem": 2}}, {"id": "B", "text": "どこか居心地が悪い。お世辞かなと思ってしまう", "score": {"self_esteem": -3}}]},
    {"id": "SE08", "type": "2択", "domain": "自己肯定", "question": "自分のことが好きかと聞かれたら", "choices": [{"id": "A", "text": "好きだと思う。完璧じゃないけど、悪くない", "score": {"self_esteem": 3}}, {"id": "B", "text": "正直、あまり好きとは言えない", "score": {"self_esteem": -3}}]},

    # 対人基盤（6問）
    {"id": "AT01", "type": "2択", "domain": "対人基盤", "question": "初対面の人と2人きりになったとき", "choices": [{"id": "A", "text": "自然に話せる。沈黙も気にならない", "score": {"attachment": 3}}, {"id": "B", "text": "緊張する。何を話せばいいか考えてしまう", "score": {"attachment": -2}}]},
    {"id": "AT02", "type": "2択", "domain": "対人基盤", "question": "辛いことがあったとき、最初にすることは", "choices": [{"id": "A", "text": "誰かに話す。聞いてもらうだけで楽になる", "score": {"attachment": 3, "O": 1}}, {"id": "B", "text": "一人で処理する。人に見せたくない", "score": {"attachment": -2, "N": 1}}]},
    {"id": "AT03", "type": "2択", "domain": "対人基盤", "question": "「助けて」と人に言えるか", "choices": [{"id": "A", "text": "言える。頼ることに抵抗がない", "score": {"attachment": 3}}, {"id": "B", "text": "言いにくい。自分でなんとかしたい", "score": {"attachment": -3}}]},
    {"id": "AT04", "type": "2択", "domain": "対人基盤", "question": "子供の頃、家は安心できる場所だったか", "choices": [{"id": "A", "text": "安心できた。帰る場所があった", "score": {"attachment": 3}}, {"id": "B", "text": "あまり安心ではなかった。外の方が楽だった", "score": {"attachment": -3}}]},
    {"id": "AT05", "type": "2択", "domain": "対人基盤", "question": "人と親しくなるスピードは", "choices": [{"id": "A", "text": "早い。すぐに打ち解けられる", "score": {"attachment": 2, "O": 1}}, {"id": "B", "text": "ゆっくり。信頼するまでに時間がかかる", "score": {"attachment": -1, "S": 1}}]},
    {"id": "AT06", "type": "2択", "domain": "対人基盤", "question": "恋人や親友に対して", "choices": [{"id": "A", "text": "安定していたい。急に距離が変わると不安になる", "score": {"attachment": -1}}, {"id": "B", "text": "自由でいたい。束縛されると窮屈になる", "score": {"attachment": 1, "D": 1}}]},

    # 経験値（5問）
    {"id": "EX01", "type": "2択", "domain": "経験値", "question": "学業や資格に本気で打ち込んだ時期があるか", "instruction": "勉強の方法論を身につけた経験", "choices": [{"id": "A", "text": "ある。かなり打ち込んだ", "score": {"exp_study": 3}}, {"id": "B", "text": "あまりない", "score": {"exp_study": -1}}]},
    {"id": "EX02", "type": "2択", "domain": "経験値", "question": "人間関係で「場を回す」役割を担うことが多かったか", "instruction": "幹事、調整役、リーダーなどの経験", "choices": [{"id": "A", "text": "多かった。自然とそうなる", "score": {"exp_social": 3}}, {"id": "B", "text": "あまりない。誰かに任せる方", "score": {"exp_social": -1}}]},
    {"id": "EX03", "type": "2択", "domain": "経験値", "question": "体力やメンタルを極限まで追い込んだ経験があるか", "instruction": "部活、スポーツ、肉体労働など", "choices": [{"id": "A", "text": "ある。限界を超えた経験がある", "score": {"exp_physical": 3}}, {"id": "B", "text": "あまりない", "score": {"exp_physical": -1}}]},
    {"id": "EX04", "type": "2択", "domain": "経験値", "question": "何かの創作に没頭した時期があるか", "instruction": "音楽、絵、文章、プログラミング、料理なども含む", "choices": [{"id": "A", "text": "ある。時間を忘れて作っていた", "score": {"exp_creative": 3}}, {"id": "B", "text": "あまりない", "score": {"exp_creative": -1}}]},
    {"id": "EX05", "type": "2択", "domain": "経験値", "question": "環境を大きく変えた経験があるか", "instruction": "転職、引越し、留学、起業など", "choices": [{"id": "A", "text": "ある。何度か大きく変えた", "score": {"exp_adventure": 3}}, {"id": "B", "text": "あまりない。同じ環境が長い", "score": {"exp_adventure": -1}}]},

    # 才能（5問）
    {"id": "TL01", "type": "2択", "domain": "才能", "question": "体を動かすことは", "choices": [{"id": "A", "text": "好き。体を動かすと気分が上がる", "score": {"talent_physical": 3}}, {"id": "B", "text": "あまり得意ではない。インドア派", "score": {"talent_physical": -1}}]},
    {"id": "TL02", "type": "2択", "domain": "才能", "question": "音楽や映画で涙が出たり、鳥肌が立つことがあるか", "choices": [{"id": "A", "text": "よくある。感情が強く動く", "score": {"talent_intuitive": 3}}, {"id": "B", "text": "あまりない。冷静に見てしまう", "score": {"talent_intuitive": -1}}]},
    {"id": "TL03", "type": "2択", "domain": "才能", "question": "物事を順序立てて人に説明するのは", "choices": [{"id": "A", "text": "得意。わかりやすく伝えられる", "score": {"talent_logical": 3}}, {"id": "B", "text": "苦手。感覚で話してしまう", "score": {"talent_logical": -1}}]},
    {"id": "TL04", "type": "2択", "domain": "才能", "question": "細かい手作業を長時間やることは", "choices": [{"id": "A", "text": "苦にならない。集中できる", "score": {"talent_dexterity": 3}}, {"id": "B", "text": "すぐ飽きてしまう", "score": {"talent_dexterity": -1}}]},
    {"id": "TL05", "type": "2択", "domain": "才能", "question": "自分の気持ちを言葉にするのは", "choices": [{"id": "A", "text": "得意。感じたことを表現できる", "score": {"talent_verbal": 3}}, {"id": "B", "text": "苦手。うまく言葉にならない", "score": {"talent_verbal": -1}}]},

    # クロス検証（6問）
    {"id": "CV01", "type": "2択", "domain": "クロス検証", "question": "休日に一番エネルギーが湧く過ごし方は", "choices": [{"id": "A", "text": "行ったことない場所に出かける", "score": {"D": 2}}, {"id": "B", "text": "好きなことにじっくり没頭する", "score": {"E": 2}}]},
    {"id": "CV02", "type": "2択", "domain": "クロス検証", "question": "ストレスを感じたとき、自然にやることは", "choices": [{"id": "A", "text": "状況を分析して対策を考える", "score": {"S": 2}}, {"id": "B", "text": "誰かに話を聞いてもらう", "score": {"O": 2}}]},
    {"id": "CV03", "type": "2択", "domain": "クロス検証", "question": "チームで成果が出たとき、一番嬉しいのは", "choices": [{"id": "A", "text": "みんなで喜びを分かち合えること", "score": {"O": 2}}, {"id": "B", "text": "自分の貢献が目に見える形で残ったこと", "score": {"N": 2}}]},
    {"id": "CV04", "type": "2択", "domain": "クロス検証", "question": "退屈な会議中、頭の中でやっていることは", "choices": [{"id": "A", "text": "全然別のアイデアを考えている", "score": {"D": 2}}, {"id": "B", "text": "話の構造を整理しようとしている", "score": {"S": 2}}]},
    {"id": "CV05", "type": "2択", "domain": "クロス検証", "question": "寝る前にふと考えるのは", "choices": [{"id": "A", "text": "明日やりたいこと、新しい計画", "score": {"D": 1, "N": 1}}, {"id": "B", "text": "今日あった出来事の振り返り", "score": {"S": 1, "O": 1}}]},
    {"id": "CV06", "type": "2択", "domain": "クロス検証", "question": "お金を自由に使えるとしたら", "choices": [{"id": "A", "text": "新しい体験や旅に使う", "score": {"D": 2}}, {"id": "B", "text": "質の高いものをじっくり味わうことに使う", "score": {"E": 2}}]},

    # 環境逆推定（4問）
    {"id": "SN01", "type": "2択", "domain": "環境逆推定", "question": "子供の頃、やりたい習い事や活動は自由にできたか", "choices": [{"id": "A", "text": "できた。やりたいことはやらせてもらえた", "score": {"env_affluence": 3}}, {"id": "B", "text": "あまりできなかった。制限が多かった", "score": {"env_affluence": -3}}]},
    {"id": "SN02", "type": "2択", "domain": "環境逆推定", "question": "新しいことを始めるとき、お金のことが最初に頭に浮かぶか", "choices": [{"id": "A", "text": "あまり気にならない。まずやってみる", "score": {"env_affluence": 2}}, {"id": "B", "text": "まずコストを計算してしまう", "score": {"env_affluence": -2}}]},
    {"id": "SN03", "type": "2択", "domain": "環境逆推定", "question": "体力や健康面で、やりたいことを諦めた経験があるか", "choices": [{"id": "A", "text": "ほとんどない", "score": {"env_health": 3}}, {"id": "B", "text": "ある。体の制約を感じることがある", "score": {"env_health": -3}}]},
    {"id": "SN04", "type": "2択", "domain": "環境逆推定", "question": "欲しいものを我慢した経験と手に入れた経験、どちらが多いか", "choices": [{"id": "A", "text": "手に入れた方が多い", "score": {"env_affluence": 2, "self_esteem": 1}}, {"id": "B", "text": "我慢した方が多い", "score": {"env_affluence": -2}}]},

    # 未来思考（4問）
    {"id": "FT01", "type": "8択", "domain": "未来思考", "question": "想像するだけでワクワクする未来に最も近いのは", "choices": [{"id": "A", "text": "まだ誰も見たことのない景色を最初に見ている自分", "score": {"D": 3}}, {"id": "B", "text": "複雑な問題の答えを見つけて「これだ」と確信している自分", "score": {"S": 3}}, {"id": "C", "text": "大切な人たちと笑い合っている自分", "score": {"O": 3}}, {"id": "D", "text": "極限の集中状態で、とてつもない成果を出している自分", "score": {"N": 3}}, {"id": "E", "text": "好きなことに完全に没頭し、最高傑作を生み出している自分", "score": {"E": 3}}, {"id": "F", "text": "新しい仲間と刺激的なプロジェクトを動かしている自分", "score": {"D": 1, "O": 2}}, {"id": "G", "text": "静かな場所で、深い知恵を積み上げている自分", "score": {"S": 2, "E": 1}}, {"id": "H", "text": "困難な状況を乗り越えて、強くなった自分", "score": {"N": 2, "D": 1}}]},
    {"id": "FT02", "type": "2択", "domain": "未来思考", "question": "5年後の自分に期待するのは", "choices": [{"id": "A", "text": "今とは全く違う世界にいること", "score": {"D": 2}}, {"id": "B", "text": "今の延長線上で、確実に深まっていること", "score": {"S": 1, "E": 1}}]},
    {"id": "FT03", "type": "2択", "domain": "未来思考", "question": "お金が無限にあったら何をするか", "choices": [{"id": "A", "text": "世界中を飛び回って、あらゆることを体験する", "score": {"D": 2, "E": 1}}, {"id": "B", "text": "大切な人たちと、最高の環境で暮らす", "score": {"O": 2, "S": 1}}]},
    {"id": "FT04", "type": "2択", "domain": "未来思考", "question": "理想の1日の過ごし方に近いのは", "choices": [{"id": "A", "text": "朝から晩まで予定がびっしり。刺激と出会いの連続", "score": {"D": 2, "N": 1}}, {"id": "B", "text": "予定は最小限。好きなことにたっぷり時間を使う", "score": {"E": 2, "S": 1}}]},
]

combined = existing + new_qs
with open('src/data/diagnosis-questions.json', 'w', encoding='utf-8') as f:
    json.dump(combined, f, ensure_ascii=False, indent=2)

print(f"既存: {len(existing)}問 + 追加: {len(new_qs)}問 = 合計: {len(combined)}問")

# ドメイン別集計
domains = {}
for q in combined:
    domains.setdefault(q['domain'], []).append(q)
print("\nドメイン別:")
for d, items in sorted(domains.items(), key=lambda x: -len(x[1])):
    print(f"  {d}: {len(items)}問")
