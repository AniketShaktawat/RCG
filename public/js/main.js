document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const profileDialog = document.getElementById('profile-dialog');
    const profileForm = document.getElementById('profile-form');

    // Show profile dialog on every new chat
    if (!document.querySelector('.chat-message')) {
        profileDialog.classList.remove('hidden');
    }


    async function sendMessage(content) {
        try {
            const response = await fetch('/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });
    
            if (!response.ok) throw new Error('Failed to send message');
    
            const assistantMessage = await response.json();
    
            // Create and append assistant message
            const chatMessages = document.getElementById('chat-messages');
            const assistantMessageHtml = createMessageElement(assistantMessage);
            chatMessages.insertAdjacentHTML('beforeend', assistantMessageHtml);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message. Please try again.');
        }
    }
    
    // Handle profile form submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm);
        const profileContent = `Patient Profile:\n- Age: ${formData.get('age')} years\n- Gender: ${formData.get('gender')}\n- Weight: ${formData.get('weight')} kg\n- Height: ${formData.get('height')} cm`;

        await sendMessage(profileContent);
        profileDialog.classList.add('hidden');
    });

    // Handle chat form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content) return;

        // Create and append user message immediately
        const userMessageHtml = createMessageElement({
            role: 'user',
            content,
            timestamp: new Date()
        });
        chatMessages.insertAdjacentHTML('beforeend', userMessageHtml);

        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Show typing indicator
        typingIndicator.classList.remove('hidden');
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Send message to server
            const response = await fetch('/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) throw new Error('Failed to send message');

            const assistantMessage = await response.json();

            // Create and append assistant message
            const assistantMessageHtml = createMessageElement(assistantMessage);
            typingIndicator.classList.add('hidden');
            chatMessages.insertAdjacentHTML('beforeend', assistantMessageHtml);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message. Please try again.');
            typingIndicator.classList.add('hidden');
        }
    });

    // Handle textarea enter key
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });




    function createMessageElement(message) {
        const isUser = message.role === 'user';
        return `
            <div class="flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}">
                <div class="h-8 w-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-200' : 'bg-green-600'}">
                    ${isUser ? `
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    ` : `
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                        </svg>
                    `}
                </div>
                <div class="p-4 max-w-[80%] rounded-lg shadow-sm ${isUser ? 'bg-white' : 'bg-green-50'}">
                    <div class="prose max-w-none">
                        ${message.content}
                    </div>
                </div>
            </div>
        `;
    }
});

function startNewChat() {
    // Clear session storage to trigger profile dialog
    sessionStorage.removeItem('profileSubmitted');
    location.href = '/chat';
}

async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this consultation?')) return;

    try {
        const response = await fetch(`/messages/${sessionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete session');

        // Remove the session from the UI
        const sessionElement = document.querySelector(`[data-session-id="${sessionId}"]`);
        if (sessionElement) {
            sessionElement.remove();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete session. Please try again.');
    }
}

function selectSession(sessionId) {
    // Store the session ID in the URL and reload
    const url = new URL(window.location);
    url.searchParams.set('session', sessionId);
    window.location = url;
}
