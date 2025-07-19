document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.querySelector('.tabs-container');
    const contentArea = document.querySelector('.content-area');
    
    // Check if FlexibleCaseRenderer is available
    if (typeof FlexibleCaseRenderer === 'undefined') {
        contentArea.innerHTML = '<p class="error">Case renderer not loaded. Please check if flexible-case-renderer.js is included.</p>';
        return;
    }
    
    const renderer = new FlexibleCaseRenderer();
    
    // Load cases data
    fetch('static/data/cases.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.cases) {
                throw new Error('Invalid data format');
            }
            renderTabs(data.cases);
            if (data.cases.length > 0) {
                showCase(data.cases[0]);
            }
        })
        .catch(error => {
            console.error('Error loading cases:', error);
            contentArea.innerHTML = `<p class="error">Failed to load cases data: ${error.message}</p>`;
        });
    
    function renderTabs(cases) {
        if (!cases || cases.length === 0) {
            tabsContainer.innerHTML = '<p class="error">No cases available</p>';
            return;
        }
        
        tabsContainer.innerHTML = cases.map((caseItem, index) => `
            <div class="tab ${index === 0 ? 'active' : ''}" data-case-id="${caseItem.id}">
                <div class="tab-title">${caseItem.title}</div>
                <div class="tab-description">${caseItem.description}</div>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const caseId = parseInt(this.dataset.caseId);
                const caseData = cases.find(c => c.id === caseId);
                if (caseData) {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    showCase(caseData);
                }
            });
        });
    }
    
    function showCase(caseData) {
        try {
            contentArea.innerHTML = renderer.renderCase(caseData);
            
            // Re-initialize Prism for syntax highlighting
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        } catch (error) {
            console.error('Error rendering case:', error);
            contentArea.innerHTML = `<p class="error">Error rendering case: ${error.message}</p>`;
        }
    }
});