document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const userInfoModal = new bootstrap.Modal(document.getElementById('userInfoModal'));
    const consultButton = document.getElementById('consultButton');
    let isProcessing = false;
    let userInfo = null;
    let conversationHistory = [];

    // Show user info modal on load
    userInfoModal.show();

    // Handle user info form submission
    document.getElementById('userInfoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        userInfo = {
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            weight: parseFloat(formData.get('weight')),
            height: parseInt(formData.get('height')),
            email:formData.get('email')
        };
        userInfoModal.hide();

        // Display user info as first message
        const userInfoMessage = `**Patient Information**:\n- Age: ${userInfo.age} years\n- Gender: ${userInfo.gender}\n- Weight: ${userInfo.weight} kg\n- Height: ${userInfo.height} cm`;
        appendMessage('system', userInfoMessage);
        conversationHistory.push({ role: 'system', content: userInfoMessage });
    });

    // Handle consult button click
    consultButton.addEventListener('click', async function() {
        if (!userInfo) {
            alert('Please provide your information first');
            userInfoModal.show();
            return;
        }

        const loadingElement = appendLoading();
        try {
            const response = await fetch('/api/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userInfo,
                    conversation: conversationHistory
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate summary');
            }

            appendMessage('system', '**Consultation Summary:**\n\n' + data.summary);
        } catch (error) {
            console.error('Summary error:', error);
            appendMessage('error', `Failed to generate consultation summary: ${error.message}`);
        } finally {
            loadingElement.remove();
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Handle form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!userInfo) {
            alert('Please provide your information first');
            userInfoModal.show();
            return;
        }

        const message = userInput.value.trim();
        if (!message || isProcessing) return;

        // Add user message to chat and conversation history
        appendMessage('user', message);
        conversationHistory.push({ role: 'user', content: message });

        // Clear input and reset height
        userInput.value = '';
        userInput.style.height = 'auto';

        // Show loading indicator
        isProcessing = true;
        const loadingElement = appendLoading();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, userInfo })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();

            // Remove loading indicator
            loadingElement.remove();

            // Add AI response to chat and conversation history
            appendMessage('assistant', data.response);
            conversationHistory.push({ role: 'assistant', content: data.response });

        } catch (error) {
            // Remove loading indicator
            loadingElement.remove();

            // Show error message
            appendMessage('error', 'Sorry, there was an error processing your request. Please try again.');
            console.error('Chat error:', error);
        } finally {
            isProcessing = false;
        }

        // Scroll to bottom
        scrollToBottom();
    });

    function appendMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = type === 'user' ? content : marked.parse(content);
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        return messageDiv;
    }

    function appendLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message loading';
        loadingDiv.innerHTML = `
            Thinking
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        scrollToBottom();
        return loadingDiv;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});