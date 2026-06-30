// scanner.js - multi.multiquiz 専用パーサー
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
            data.points_default = parseInt(line.substring(15)) || 2;
        } else if (line.startsWith('section:')) {
            currentSection = line.substring(8).trim().replace(/^"|"$/g, '');
            data.sections.push(currentSection);
        } 
        // 変数定義
        else if (line.includes('=') && !line.startsWith('{')) {
            const [key, valueStr] = line.split('=').map(s => s.trim());
            data.variables[key] = parseValue(valueStr);
        } 
        // 問題ブロック
        else if (line.startsWith('{')) {
            let block = line + '\n';
            let brace = 1;
            i++;

            while (i < lines.length && brace > 0) {
                const nextLine = lines[i];
                block += nextLine + '\n';
                if (nextLine.includes('{')) brace++;
                if (nextLine.includes('}')) brace--;
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

function parseValue(str) {
    str = str.trim();
    if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1);
    if (!isNaN(str)) return Number(str);
    if (str.startsWith('[') && str.endsWith(']')) {
        try { return JSON.parse(str); } catch(e) { return str; }
    }
    return str;
}

function parseQuizBlock(block) {
    try {
        // key: value を "key": value に変換
        let jsonStr = block
            .replace(/(\w+):/g, '"$1":')
            .replace(/,\s*}/g, '}')
            .replace(/}\s*}/g, '}}');

        const quiz = JSON.parse(jsonStr);
        return quiz;
    } catch (e) {
        console.error("解析失敗:", block.substring(0, 100));
        return null;
    }
}
