// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.updateThemeButton();
        
        // Add event listener for theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.updateThemeButton();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateThemeButton() {
        const icon = document.getElementById('themeIcon');
        const text = document.getElementById('themeText');
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }
}

// API utilities
class APIManager {
    static async request(url, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }
            
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
}

// UI utilities
class UIManager {
    static showLoading() {
        const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
        modal.show();
    }

    static hideLoading() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
        if (modal) {
            modal.hide();
        }
    }

    static showAlert(message, type = 'danger') {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Find the active tab content
        const activeTab = document.querySelector('.tab-pane.active');
        if (activeTab) {
            const existingAlert = activeTab.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }
            activeTab.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    static formatMessage(content, type) {
        const senderLabel = type === 'user' ? 'You' : 'AI';
        const messageClass = type === 'user' ? 'user' : 'ai';
        
        return `
            <div class="chat-message ${messageClass}">
                <span class="sender">${senderLabel}:</span>
                <div class="content">${this.escapeHtml(content)}</div>
            </div>
        `;
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }

    static setButtonLoading(button, loading = true) {
        if (loading) {
            button.disabled = true;
            const originalText = button.innerHTML;
            button.dataset.originalText = originalText;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }
}

// Chat history manager
class ChatHistoryManager {
    static displayHistory(history, containerId) {
        const container = document.getElementById(containerId);
        
        if (!history || history.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>No messages yet. Start a conversation!</p></div>';
            return;
        }

        container.innerHTML = history.map(msg => 
            UIManager.formatMessage(msg.content, msg.type)
        ).join('');
        
        UIManager.scrollToBottom(container);
    }

    static addMessage(content, type, containerId) {
        const container = document.getElementById(containerId);
        const emptyState = container.querySelector('.empty-state');
        
        if (emptyState) {
            emptyState.remove();
        }
        
        container.insertAdjacentHTML('beforeend', UIManager.formatMessage(content, type));
        UIManager.scrollToBottom(container);
    }
}

// Form handlers
class FormHandlers {
    static async handleSummarizer(event) {
        event.preventDefault();
        
        const textArea = document.getElementById('textToSummarize');
        const text = textArea.value.trim();
        const button = document.getElementById('summarizeBtn');
        
        if (!text) {
            UIManager.showAlert('Please enter some text to summarize.');
            return;
        }

        try {
            UIManager.setButtonLoading(button, true);
            
            const result = await APIManager.request('/summarize', 'POST', { text });
            
            // Add user message
            ChatHistoryManager.addMessage(text, 'user', 'summarizerHistory');
            
            // Add AI response
            ChatHistoryManager.addMessage(result.summary, 'ai', 'summarizerHistory');
            
            // Clear form
            textArea.value = '';
            
            UIManager.showAlert('Text summarized successfully!', 'success');
            
        } catch (error) {
            UIManager.showAlert(error.message || 'Failed to summarize text.');
        } finally {
            UIManager.setButtonLoading(button, false);
        }
    }

    static async handleQuiz(event) {
        event.preventDefault();
        
        const topicInput = document.getElementById('quizTopic');
        const topic = topicInput.value.trim();
        const button = document.getElementById('generateQuizBtn');
        
        if (!topic) {
            UIManager.showAlert('Please enter a topic for the quiz.');
            return;
        }

        try {
            UIManager.setButtonLoading(button, true);
            
            const result = await APIManager.request('/generate_quiz', 'POST', { topic });
            
            // Add user message
            ChatHistoryManager.addMessage(`Topic: ${topic}`, 'user', 'quizHistory');
            
            // Add AI response
            ChatHistoryManager.addMessage(result.quiz, 'ai', 'quizHistory');
            
            // Clear form
            topicInput.value = '';
            
            UIManager.showAlert('Quiz generated successfully!', 'success');
            
        } catch (error) {
            UIManager.showAlert(error.message || 'Failed to generate quiz.');
        } finally {
            UIManager.setButtonLoading(button, false);
        }
    }

    static async handleChat(event) {
        event.preventDefault();
        
        const messageInput = document.getElementById('chatInput');
        const message = messageInput.value.trim();
        const button = document.getElementById('sendChatBtn');
        
        if (!message) {
            UIManager.showAlert('Please enter a message.');
            return;
        }

        try {
            UIManager.setButtonLoading(button, true);
            
            // Add user message immediately
            ChatHistoryManager.addMessage(message, 'user', 'chatHistory');
            
            // Clear input
            messageInput.value = '';
            
            const result = await APIManager.request('/chat', 'POST', { message });
            
            // Add AI response
            ChatHistoryManager.addMessage(result.response, 'ai', 'chatHistory');
            
        } catch (error) {
            UIManager.showAlert(error.message || 'Failed to send message.');
        } finally {
            UIManager.setButtonLoading(button, false);
        }
    }
}

// Clear history function
async function clearHistory(tool) {
    if (!confirm(`Are you sure you want to clear the ${tool} history?`)) {
        return;
    }

    try {
        await APIManager.request(`/clear_history/${tool}`, 'POST');
        
        // Clear UI
        const containerId = tool.toLowerCase() + 'History';
        ChatHistoryManager.displayHistory([], containerId);
        
        UIManager.showAlert(`${tool} history cleared successfully!`, 'success');
        
    } catch (error) {
        UIManager.showAlert(error.message || 'Failed to clear history.');
    }
}

// Load history for active tab
async function loadHistoryForTab(tool) {
    try {
        const result = await APIManager.request(`/get_history/${tool}`);
        const containerId = tool.toLowerCase() + 'History';
        ChatHistoryManager.displayHistory(result.history, containerId);
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme manager
    new ThemeManager();
    
    // Add form event listeners
    document.getElementById('summarizerForm').addEventListener('submit', FormHandlers.handleSummarizer);
    document.getElementById('quizForm').addEventListener('submit', FormHandlers.handleQuiz);
    document.getElementById('chatForm').addEventListener('submit', FormHandlers.handleChat);
    
    // Load initial history
    loadHistoryForTab('Summarizer');
    
    // Add tab change listeners to load history
    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const targetId = event.target.getAttribute('data-bs-target').substring(1);
            let tool = '';
            
            switch(targetId) {
                case 'summarizer':
                    tool = 'Summarizer';
                    break;
                case 'quiz':
                    tool = 'Quiz';
                    break;
                case 'chatbot':
                    tool = 'Chatbot';
                    break;
            }
            
            if (tool) {
                loadHistoryForTab(tool);
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + Enter to submit forms
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab) {
                const form = activeTab.querySelector('form');
                if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true }));
                }
            }
        }
    });
    
    // Auto-focus chat input when tab becomes active
    document.getElementById('chatbot-tab').addEventListener('shown.bs.tab', function() {
        document.getElementById('chatInput').focus();
    });
});
