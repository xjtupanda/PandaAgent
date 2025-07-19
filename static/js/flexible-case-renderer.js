// Flexible Case Renderer
class FlexibleCaseRenderer {
    constructor() {
        this.renderers = {
            'image': this.renderImage.bind(this),
            'question': this.renderQuestion.bind(this),
            'thinking': this.renderThinking.bind(this),
            'code': this.renderCode.bind(this),
            'generated_images': this.renderGeneratedImages.bind(this),
            'answer': this.renderAnswer.bind(this)
        };
    }

    renderCase(caseData) {
        if (!caseData || !caseData.sections) {
            return '<div class="error">Invalid case data</div>';
        }

        let html = '<div class="case-container">';
        
        // Group thinking rounds
        const thinkingRounds = this.groupThinkingRounds(caseData.sections);
        
        caseData.sections.forEach((section, index) => {
            if (section.type === 'thinking' && thinkingRounds[section.data.round] && thinkingRounds[section.data.round].length > 1) {
                // Skip if this thinking section is part of a group that's already rendered
                if (thinkingRounds[section.data.round][0] !== section) {
                    return;
                }
                // Render all thinking sections for this round together
                html += this.renderThinkingRound(thinkingRounds[section.data.round]);
            } else if (section.type !== 'thinking') {
                // Render non-thinking sections normally
                html += this.renderSection(section);
            } else {
                // Single thinking section
                html += this.renderSection(section);
            }
        });
        
        html += '</div>';
        return html;
    }

    groupThinkingRounds(sections) {
        const rounds = {};
        sections.forEach(section => {
            if (section.type === 'thinking' && section.data.round) {
                if (!rounds[section.data.round]) {
                    rounds[section.data.round] = [];
                }
                rounds[section.data.round].push(section);
            }
        });
        return rounds;
    }

    renderSection(section) {
        const renderer = this.renderers[section.type];
        if (!renderer) {
            console.warn(`No renderer found for section type: ${section.type}`);
            return '';
        }
        return renderer(section.data);
    }

    renderThinkingRound(thinkingSections) {
        let html = '<div class="thinking-round">';
        html += '<h3 class="thinking-round-title">🤔Thinking Process</h3>';
        thinkingSections.forEach(section => {
            html += this.renderThinking(section.data, false);
        });
        html += '</div>';
        return html;
    }

    renderImage(data) {
        return `
            <div class="section image-section">
                <div class="image-container">
                    <img src="${data.src}" alt="${data.caption || 'Image'}" 
                         ${data.width ? `style="max-width: ${data.width}px; width: 100%;"` : ''}>
                    ${data.caption ? `<p class="image-caption">${data.caption}</p>` : ''}
                </div>
            </div>
        `;
    }

    renderQuestion(data) {
        return `
            <div class="section question-section">
                <h3 class="section-title">❓User Prompt</h3>
                <div class="question-box">
                    ${this.formatText(data.text)}
                </div>
            </div>
        `;
    }

    renderThinking(data, includeTitle = true) {
        const formattedText = data.text.trim().replace(/\n/g, '<br>');
        
        return `
            <div class="section thinking-section">
                ${includeTitle ? '<h3 class="section-title">🤔Thinking Process</h3>' : ''}
                <div class="thinking-process">${formattedText}</div>
            </div>
        `;
    }

    renderCode(data) {
        const language = data.language || 'python';
        return `
            <div class="section code-section">
                <h3 class="section-title">💻Generated Code</h3>
                <div class="code-container">
                    <pre class="line-numbers"><code class="language-${language}">${this.escapeHtml(data.code)}</code></pre>
                </div>
            </div>
        `;
    }

    renderGeneratedImages(data) {
        if (!data.images && !data.results) {
            return '';
        }

        // const title = data.title || "💡Generated Results";
        const title = "💡Generated Results";

        let html = `
            <div class="section generated-images-section">
                <h3 class="section-title">${title}</h3>
                <div class="result-images">
        `;

        // Process image
        if (data.images) {
            data.images.forEach(img => {
                html += `
                    <div class="result-image">
                        <img src="${img.src}" 
                            alt="${img.caption || "💡Generated image"}"
                            ${img.width ? `style="max-width: ${img.width}px; width: 100%;"` : ''}>
                        ${img.caption ? `<p class="result-image-caption">${img.caption}</p>` : ''}
                    </div>
                `;
            });
        }

        // Process text/digits results
        if (data.results) {
            data.results.forEach(result => {
                html += `
                    <div class="result-item">
                        <pre class="code-block"><code>${this.escapeHtml(result.value)}</code></pre>
                        ${result.caption ? `<p class="result-image-caption">${result.caption}</p>` : ''}
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    renderAnswer(data) {
        return `
            <div class="section answer-section">
                <h3 class="section-title">✅Final Answer</h3>
                <div class="answer-container">
                    <div class="answer-box">${this.escapeHtml(data.text)}</div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format text. Remove empty lines at heads and tails.
    formatText(text) {
        if (!text) return '';
        const lines = text.split('\n');
        while (lines.length > 0 && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }
        const cleaned = lines.join('\n');
        const escaped = this.escapeHtml(cleaned);
        return escaped.replace(/\n/g, '<br>');
    }
}