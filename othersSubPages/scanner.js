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
    const data = { title: "クイズ", quizzes: [] };
    const blocks = text.split(/\{/).slice(1);

    blocks.forEach(blockStr => {
        const block = '{' + blockStr.split('}')[0] + '}';
        try {
            let jsonStr = block
                .replace(/(\w+):/g, '"$1":')
                .replace(/,\s*}/g, '}');

            const quiz = JSON.parse(jsonStr);
            if (quiz.question) data.quizzes.push(quiz);
        } catch(e) {}
    });

    return data;
}
