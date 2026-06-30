// scanner.js
export async function loadQuizFile(source, isUrl = true) {
    let text;
    if (isUrl) {
        const res = await fetch(source);
        text = await res.text();
    } else {
        text = source;
    }
    return parseMultiquiz(text);
}

function parseMultiquiz(text) {
    const data = {
        title: "クイズ",
        description: "",
        quizzes: []
    };

    // 簡易ブロック抽出
    const blocks = text.split(/\{/).filter(b => b.includes('question')).map(b => '{' + b);

    blocks.forEach(block => {
        try {
            let clean = block
                .replace(/(\w+):/g, '"$1":')
                .replace(/,\s*}/g, '}');

            const quiz = JSON.parse(clean);
            if (quiz.question) data.quizzes.push(quiz);
        } catch(e) {
            console.log("解析スキップ:", block.substring(0, 50));
        }
    });

    return data;
}
