// scanner.js
const MultiQuizScanner = (function() {
    function parse(content) {
        const lines = content.split('\n');
        const quiz = {
            title: '',
            description: '',
            points_default: 2,
            variables: {},
            sections: []
        };

        let currentSection = null;
        let i = 0;

        while (i < lines.length) {
            let line = lines[i].trim();

            // Skip comments and empty lines
            if (!line || line.startsWith('//')) {
                i++;
                continue;
            }

            // Title and metadata
            if (line.startsWith('title:')) {
                quiz.title = line.substring(6).trim().replace(/"/g, '');
            }
            else if (line.startsWith('description:')) {
                quiz.description = line.substring(12).trim().replace(/"/g, '');
            }
            else if (line.startsWith('points_default:')) {
                quiz.points_default = parseInt(line.substring(15).trim()) || 2;
            }
            else if (line.includes('=')) {
                // Variable assignment
                const [key, value] = line.split('=').map(s => s.trim().replace(/[";]/g, ''));
                quiz.variables[key] = value;
            }
            else if (line.startsWith('section:')) {
                currentSection = {
                    title: line.substring(8).trim().replace(/"/g, ''),
                    questions: []
                };
                quiz.sections.push(currentSection);
            }
            else if (line.startsWith('{')) {
                // Parse question block
                let block = '';
                let braceCount = 1;
                block += line + '\n';
                i++;

                while (i < lines.length && braceCount > 0) {
                    const nextLine = lines[i];
                    block += nextLine + '\n';
                    if (nextLine.includes('{')) braceCount++;
                    if (nextLine.includes('}')) braceCount--;
                    i++;
                }

                if (currentSection) {
                    const question = parseQuestionBlock(block);
                    if (question) currentSection.questions.push(question);
                }
                continue; // i already advanced
            }

            i++;
        }

        return quiz;
    }

    function parseQuestionBlock(blockStr) {
        try {
            // Convert pseudo-JSON to real JS object
            let cleaned = blockStr
                .replace(/\/\/.*$/gm, '')                    // remove inline comments
                .replace(/(\w+):/g, '"$1":')                 // quote keys
                .replace(/,(\s*[}\]])/g, '$1');             // trailing commas

            // Evaluate safely
            const q = new Function('return ' + cleaned)();

            // Default points
            if (!q.points) q.points = 2;

            return q;
        } catch (e) {
            console.warn('Question parsing failed:', blockStr, e);
            return null;
        }
    }

    return {
        parse: parse
    };
})();
