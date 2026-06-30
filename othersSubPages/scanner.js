// scanner.js - Multiquiz パーサー

function scanMultiquiz(text) {
    const lines = text.split(/\r?\n/);
    const quizzes = [];
    let title = "無題のクイズ";
    let currentSection = "";

    let i = 0;
    while (i < lines.length) {
        let line = lines[i].trim();

        if (line.startsWith('//') || line === '') {
            i++; continue;
        }

        // タイトル設定
        if (line.startsWith('title:')) {
            title = line.substring(6).trim().replace(/^"|"$/g, '');
            i++; continue;
        }

        // 大問
        if (line.startsWith('section:')) {
            currentSection = line.substring(8).trim().replace(/^"|"$/g, '');
            i++; continue;
        }

        // 問題ブロック開始
        if (line === '{') {
            let block = '';
            i++;
            while (i < lines.length && lines[i].trim() !== '}') {
                block += lines[i] + '\n';
                i++;
            }
            const quiz = parseQuizBlock(block, currentSection);
            if (quiz) quizzes.push(quiz);
        }
        i++;
    }

    return { title, quizzes, error: null };
}

function parseQuizBlock(block, section) {
    // 簡易JSON風パーサー（本格版は要改善）
    try {
        // 簡略化のため、本格実装は後で
        // ここでは例としてオブジェクトを返す
        return {
            section: section,
            type: "single",
            question: "サンプル問題",
            options: ["A", "B", "C"],
            correct: 0,
            points: 2,
            note: "サンプル注釈"
        };
    } catch (e) {
        console.error("パースエラー", e);
        return null;
    }
}

// 問題HTML生成関数（HTML側から呼ぶ）
function renderQuestionHTML(quiz, index) {
    // ここに各typeごとのHTML生成ロジックを書く
    return `<div class="quiz-item"><h3>${quiz.question}</h3></div>`;
}
