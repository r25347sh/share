// scanner.js
export async function loadQuizFile(urlOrText, isUrl = true) {
    let text;
    if (isUrl) {
        const res = await fetch(urlOrText);
        text = await res.text();
    } else {
        text = urlOrText;
    }
    return parseMultiquiz(text);
}

function parseMultiquiz(text) {
    const lines = text.split(/\r?\n/);
    const quizData = {
        title: "Untitled Quiz",
        description: "",
        points_default: 2,
        variables: {},
        sections: [],
        quizzes: []
    };

    let currentSection = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('//')) return;

        // 設定行
        if (line.startsWith('title:')) {
            quizData.title = line.split(':')[1].trim().replace(/"/g, '');
        } else if (line.startsWith('description:')) {
            quizData.description = line.split(':')[1].trim().replace(/"/g, '');
        } else if (line.startsWith('section:')) {
            currentSection = line.split(':')[1].trim().replace(/"/g, '');
            quizData.sections.push(currentSection);
        } 
        // 変数定義
        else if (line.includes('=') && !line.startsWith('{')) {
            const [key, value] = line.split('=').map(s => s.trim());
            quizData.variables[key] = parseValue(value);
        } 
        // 問題ブロック
        else if (line.startsWith('{')) {
            let block = '';
            // 簡易的に1ブロックを読み取る（実際はもっと賢くする必要あり）
            // ここは簡略版です
            console.log("Problem block detected");
        }
    });

    return quizData;
}

function parseValue(value) {
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    if (!isNaN(value)) return Number(value);
    if (value.startsWith('[')) return eval(value); // 危険なので本番は専用パーサー推奨
    return value;
}
