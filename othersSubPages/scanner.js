// scanner.js - 強化版パーサー
export async function loadQuizFile(source, isUrl = true) {
    let text;
    if (isUrl) {
        const res = await fetch(source);
        if (!res.ok) throw new Error('ファイル取得失敗');
        text = await res.text();
    } else {
        text = source;
    }
    return parseMultiquiz(text);
}

function parseMultiquiz(text) {
    const lines = text.split(/\r?\n/);
    const data = {
        title: "Untitled Quiz",
        description: "",
        points_default: 2,
        variables: {},
        sections: [],
        quizzes: []
    };

    let currentSection = null;
    let i = 0;

    while (i < lines.length) {
        let line = lines[i].trim();

        if (!line || line.startsWith('//')) {
            i++;
            continue;
        }

        // 設定行
        if (line.startsWith('title:')) {
            data.title = line.substring(6).trim().replace(/^"|"$/g, '');
        } else if (line.startsWith('description:')) {
            data.description = line.substring(12).trim().replace(/^"|"$/g, '');
        } else if (line.startsWith('points_default:')) {
            data.points_default = parseInt(line.substring(15).trim()) || 2;
        } else if (line.startsWith('section:')) {
            currentSection = line.substring(8).trim().replace(/^"|"$/g, '');
            data.sections.push(currentSection);
        } 
        // 変数定義
        else if (line.includes('=') && !line.startsWith('{')) {
            const eqIndex = line.indexOf('=');
            const key = line.substring(0, eqIndex).trim();
            let value = line.substring(eqIndex + 1).trim();
            data.variables[key] = parseVariableValue(value);
        } 
        // 問題ブロック { ... }
        else if (line.startsWith('{')) {
            let block = '';
            let braceCount = 1;
            block += line + '\n';
            i++;

            while (i < lines.length && braceCount > 0) {
                line = lines[i];
                block += line + '\n';
                if (line.includes('{')) braceCount++;
                if (line.includes('}')) braceCount--;
                i++;
            }

            const quiz = parseQuizBlock(block);
            if (quiz) {
                if (currentSection) quiz.section = currentSection;
                data.quizzes.push(quiz);
            }
            continue;
        }

        i++;
    }

    return data;
}

function parseVariableValue(value) {
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    if (!isNaN(value)) return Number(value);
    if (value.startsWith('[') && value.endsWith(']')) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    return value;
}

function parseQuizBlock(block) {
    try {
        // 簡易JSON風パーサー（{ key: value, } を許容）
        let jsonStr = block
            .replace(/(\w+):/g, '"$1":')           // key: → "key":
            .replace(/,\s*}/g, '}');               // 末尾カンマ除去

        const quiz = JSON.parse(jsonStr);
        return quiz;
    } catch (e) {
        console.error("ブロック解析エラー:", block, e);
        return null;
    }
}
