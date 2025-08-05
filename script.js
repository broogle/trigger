class TriggerLines {
    constructor() {
        this.isGenerating = false;
        this.backendUrl = window.location.origin;
        
        this.initializeElements();
        this.bindEvents();
        this.checkBackendHealth();
    }

    initializeElements() {
        this.loadingState = document.getElementById('loadingState');
        this.messageContent = document.getElementById('messageContent');
        this.messageContainer = document.getElementById('messageContainer');
    }

    bindEvents() {
        // No frontend settings needed - all handled by backend
    }

    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.backendUrl}/api/health`);
            if (response.ok) {
                const health = await response.json();
                console.log('🔥 Backend connected:', health);
                this.generateInitialMessage();
            } else {
                throw new Error('Backend health check failed');
            }
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            this.displayError('Backend server not available. Please start the server with "npm start" and refresh.');
        }
    }

    async generateInitialMessage() {
        const initialWords = [
            'POWER', 'STRENGTH', 'VICTORY', 'COURAGE', 'FIRE', 'LIGHTNING', 
            'THUNDER', 'STORM', 'UNSTOPPABLE', 'FEARLESS', 'WARRIOR', 'CHAMPION'
        ];
        const randomWord = initialWords[Math.floor(Math.random() * initialWords.length)];
        await this.generateMessage(randomWord);
    }

    async generateMessage(triggerWord) {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        this.showLoading();

        try {
            const message = await this.callLLM(triggerWord);
            this.displayMessage(message, triggerWord);
        } catch (error) {
            console.error('Error generating message:', error);
            this.displayError(error.message);
        } finally {
            this.isGenerating = false;
        }
    }

    showLoading() {
        this.loadingState.style.display = 'block';
        this.messageContent.style.display = 'none';
        this.messageContent.classList.remove('visible');
    }

    displayMessage(message, triggerWord) {
        // Hide loading
        this.loadingState.style.display = 'none';
        
        // Process and display message
        const processedMessage = this.processMessage(message);
        this.messageContent.innerHTML = `<div class="message-text">${processedMessage}</div>`;
        this.messageContent.style.display = 'block';
        
        // Fade in
        setTimeout(() => {
            this.messageContent.classList.add('visible');
        }, 100);

        // Add click handlers to words
        this.addWordClickHandlers();
    }

    processMessage(message) {
        // Clean and format the message
        let processed = message.toUpperCase().trim();
        
        // Split into words and wrap each in a clickable span
        const words = processed.split(/(\s+)/);
        return words.map(word => {
            if (word.trim() && !word.match(/^\s+$/)) {
                // Remove punctuation for the trigger word, but keep it for display
                const cleanWord = word.replace(/[^\w]/g, '');
                return `<span class="word" data-word="${cleanWord}">${word}</span>`;
            }
            return word;
        }).join('');
    }

    addWordClickHandlers() {
        const wordElements = this.messageContent.querySelectorAll('.word');
        wordElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const word = e.target.dataset.word;
                if (word && word.length > 2) { // Only trigger for words longer than 2 characters
                    e.target.classList.add('clicked');
                    setTimeout(() => e.target.classList.remove('clicked'), 300);
                    this.generateMessage(word);
                }
            });
        });
    }

    displayError(errorMessage) {
        this.loadingState.style.display = 'none';
        this.messageContent.innerHTML = `
            <div class="message-text" style="color: #ff6b6b; text-align: center;">
                <p>UNABLE TO GENERATE MESSAGE</p>
                <br>
                <p style="font-size: 0.9rem; opacity: 0.8;">${errorMessage}</p>
                <br>
                <p style="font-size: 0.8rem; opacity: 0.6;">Check your API configuration in settings</p>
            </div>
        `;
        this.messageContent.style.display = 'block';
        this.messageContent.classList.add('visible');
    }

    async callLLM(triggerWord) {
        const response = await fetch(`${this.backendUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                triggerWord: triggerWord
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        return data.message;
    }


}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.triggerLinesInstance = new TriggerLines();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'R' to reload/generate new message
    if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        const triggerLines = window.triggerLinesInstance;
        if (triggerLines && !triggerLines.isGenerating) {
            triggerLines.generateInitialMessage();
        }
    }
});