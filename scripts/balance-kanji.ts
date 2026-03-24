/**
 * 漢字使用回数の均等化スクリプト
 *
 * 1. NG漢字を含む名前を置換
 * 2. 重複名を置換
 * 3. 20回超えの漢字を含む名前を置換
 * APIは使わず辞書から代替漢字を選んで差し替える。
 *
 * Usage: npx tsx scripts/balance-kanji.ts
 */

import * as fs from "fs";
import * as path from "path";

const KANJI_MAX = 20;

const namesFile = path.resolve(__dirname, "../src/data/names-2880.json");
const dictFile = path.resolve(__dirname, "../src/data/kanji-dictionary.json");

// NG漢字（fix-names.tsと同じ）
const boringChars = new Set(
  "庭老温読書店室料理食飲茶酒昼育教習学研練訓培養児幼園校院病薬医患治療休眠寝起床洗浴職工根蔵歴典市蒸蓄案味索直線会記探変具語重着実軽歩友並普薄淡"
);

function toRomaji(reading: string): string {
  const map: Record<string, string> = {
    あ:"a",い:"i",う:"u",え:"e",お:"o",
    か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",
    さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",
    た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",
    な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",
    は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",
    ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",
    や:"ya",ゆ:"yu",よ:"yo",
    ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",
    わ:"wa",を:"wo",ん:"n",
    が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",
    ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",
    だ:"da",ぢ:"di",づ:"du",で:"de",ど:"do",
    ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",
    ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",
    きゃ:"kya",きゅ:"kyu",きょ:"kyo",
    しゃ:"sha",しゅ:"shu",しょ:"sho",
    ちゃ:"cha",ちゅ:"chu",ちょ:"cho",
    にゃ:"nya",にゅ:"nyu",にょ:"nyo",
    ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",
    みゃ:"mya",みゅ:"myu",みょ:"myo",
    りゃ:"rya",りゅ:"ryu",りょ:"ryo",
    ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",
    じゃ:"ja",じゅ:"ju",じょ:"jo",
    びゃ:"bya",びゅ:"byu",びょ:"byo",
    ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",
    っ:"",ー:"-",
  };
  let result = "";
  let i = 0;
  while (i < reading.length) {
    const two = reading[i] + (reading[i + 1] || "");
    if (map[two]) {
      result += map[two];
      i += 2;
    } else if (map[reading[i]]) {
      result += map[reading[i]];
      i++;
    } else {
      result += reading[i];
      i++;
    }
  }
  // CamelCase: capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function main() {
  const names: any[] = JSON.parse(fs.readFileSync(namesFile, "utf-8"));
  const dict: any[] = JSON.parse(fs.readFileSync(dictFile, "utf-8"));

  // 辞書マップ (kanji -> entry)
  const dictMap: Record<string, any> = {};
  for (const k of dict) {
    if (!boringChars.has(k.kanji)) dictMap[k.kanji] = k;
  }

  // 現在の漢字使用回数を集計
  const freq: Record<string, number> = {};
  for (const n of names) {
    for (const c of n.kanji_name) {
      if (/[\u4e00-\u9fff]/.test(c)) freq[c] = (freq[c] || 0) + 1;
    }
  }

  // 使用済み名前セット（重複防止）
  const usedNames = new Set(names.map((n: any) => n.kanji_name));

  let totalFixed = 0;

  // 代替漢字を1文字選んで名前を置換するヘルパー
  function replaceKanjiInName(name: any, posToReplace: number): boolean {
    const otherKanji = name.kanji_name[posToReplace === 0 ? 1 : 0];

    const candidates = Object.entries(freq)
      .filter(([k, cnt]) => {
        if (!dictMap[k]) return false;
        if (k === otherKanji) return false;
        if (boringChars.has(k)) return false;
        return cnt < KANJI_MAX;
      })
      .sort((a, b) => a[1] - b[1]);

    for (const [candidate] of candidates) {
      const newKanji =
        posToReplace === 0
          ? candidate + otherKanji
          : otherKanji + candidate;

      if (usedNames.has(newKanji)) continue;

      const r0 = posToReplace === 0 ? dictMap[candidate]?.reading : dictMap[otherKanji]?.reading;
      const r1 = posToReplace === 0 ? dictMap[otherKanji]?.reading : dictMap[candidate]?.reading;
      const newReading = (r0 || "") + (r1 || "");
      const newRomaji = capitalize(toRomaji(r0 || "")) + capitalize(toRomaji(r1 || ""));

      usedNames.delete(name.kanji_name);
      const oldKanji = name.kanji_name[posToReplace];
      freq[oldKanji] = (freq[oldKanji] || 1) - 1;
      freq[candidate] = (freq[candidate] || 0) + 1;

      name.kanji_name = newKanji;
      name.reading = newReading;
      name.romaji = newRomaji;

      usedNames.add(newKanji);
      totalFixed++;
      return true;
    }
    return false;
  }

  // === PASS 1: NG漢字を含む名前を置換 ===
  console.log("--- PASS 1: NG漢字の修正 ---");
  let ngFixed = 0;
  for (const name of names) {
    const chars = name.kanji_name.split("");
    for (let pos = 0; pos < chars.length; pos++) {
      if (boringChars.has(chars[pos])) {
        const ok = replaceKanjiInName(name, pos);
        if (ok) { ngFixed++; break; }
        else console.warn(`  警告: ${name.pattern_id} (${name.kanji_name}) NG修正失敗`);
      }
    }
  }
  console.log(`NG修正: ${ngFixed}件\n`);

  // === PASS 2: 重複名を置換 ===
  console.log("--- PASS 2: 重複名の修正 ---");
  let dupeFixed = 0;
  const seenMap = new Map<string, number>();
  for (const name of names) {
    if (seenMap.has(name.kanji_name)) {
      const ok = replaceKanjiInName(name, 0) || replaceKanjiInName(name, 1);
      if (ok) dupeFixed++;
      else console.warn(`  警告: ${name.pattern_id} (${name.kanji_name}) 重複修正失敗`);
    } else {
      seenMap.set(name.kanji_name, name.pattern_id);
    }
  }
  console.log(`重複修正: ${dupeFixed}件\n`);

  // === PASS 3: 上限超え漢字の均等化 ===
  console.log("--- PASS 3: 漢字頻度の均等化 ---");
  const overused = new Set(
    Object.entries(freq).filter(([, cnt]) => cnt > KANJI_MAX).map(([k]) => k)
  );
  console.log(`上限超え漢字 (>${KANJI_MAX}回): ${[...overused].join("") || "なし"}`);

  for (const badKanji of overused) {
    const targets = names.filter((n) => n.kanji_name.includes(badKanji));
    const toReplace = targets.slice(KANJI_MAX);
    console.log(`${badKanji}: ${targets.length}回 → ${toReplace.length}件を置換`);

    for (const name of toReplace) {
      const pos = name.kanji_name.indexOf(badKanji);
      const ok = replaceKanjiInName(name, pos);
      if (!ok) console.warn(`  警告: ${name.pattern_id} (${name.kanji_name}) 均等化失敗`);
    }
  }

  // 保存
  const sorted = names.sort((a: any, b: any) => a.pattern_id - b.pattern_id);
  fs.writeFileSync(namesFile, JSON.stringify(sorted, null, 2), "utf-8");

  console.log(`\n完了! ${totalFixed}件置換`);

  // 結果確認
  const finalFreq: Record<string, number> = {};
  for (const n of sorted) {
    for (const c of n.kanji_name) {
      if (/[\u4e00-\u9fff]/.test(c)) finalFreq[c] = (finalFreq[c] || 0) + 1;
    }
  }
  const stillOver = Object.entries(finalFreq).filter(([, v]) => v > KANJI_MAX);
  console.log(`20回超え残り: ${stillOver.length}字`);
  if (stillOver.length > 0) {
    stillOver.sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, v]) => console.log(`  ${k}: ${v}回`));
  }
  const top5 = Object.entries(finalFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log("最多使用漢字TOP5:", top5.map(([k, v]) => `${k}(${v})`).join(", "));
}

main();
