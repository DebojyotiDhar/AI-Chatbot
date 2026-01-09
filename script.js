const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

let aiResponses = null;

async function loadAIResponses() {
    try{
        const response = await fetch('responses.json');
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        aiResponses = await response.json();
        showNotification('I am ready');
    } catch (error){
        aiResponses = {
            default_responses: [
                "Hello! I'm your AI Assistant. How can I help you?",
                "I'm here to assist you with your questions.",
                "Thanks for your message! I'm ready to help",
            ]
        };

        showNotification('Using basic responses. Full database could not be loaded.', 'warning');
    }
}

function showNotification(message, type='success'){
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function addMessage(message, isUser = false){
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message': 'bot-message'}`;
    
    if(isUser){
        messageDiv.innerHTML = `
            <div class="user-avatar"><i class="fas fa-user"></i></div>
            <div><div class="message-content">${message}</div></div>
        `;
    }else{
        messageDiv.innerHTML = `
            <div class="bot-avatar"><i class="fas fa-robot"></i></div>
            <div><div class="message-content">${message}</div></div>
        `;
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator(){
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="bot-avatar"><i class="fas fa-robot"></i></div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator(){
    const typingIndicator = document.getElementById("typing-indicator");
    if(typingIndicator){
        typingIndicator.remove();
    }
}

function getAIResponse(userMessage) {  
    const lowerCaseMessage = userMessage.toLowerCase().trim();
    if(!aiResponses){
        return "I'm still loading my knowledge base. Please try again in a moment";
    }

    for (const category in aiResponses){
        if(category === 'default_responses') continue;

        const categoryResponses = aiResponses[category];
        for(const key in categoryResponses){
            if(lowerCaseMessage.includes(key)){
                const responses = categoryResponses[key];
                if(Array.isArray(responses) && responses.length > 0){
                    const randomIndex = Math.floor(Math.random() * responses.length);
                    return responses[randomIndex];
                }else if(typeof responses === 'string'){
                    return responses;
                }
            }
        }
    }

    if (aiResponses.default_responses && aiResponses.default_responses.length>0){
        const randomIndex = Math.floor(Math.random() * aiResponses.default_responses.length);
        return aiResponses.default_responses[randomIndex];
    }

    return "Thanks for your message! I'm still learning, but I'll do my best to help you. Could you try rephrasing your questions?";
}

function getAIResponseWithTracking(userMessage){
    const lowerCaseMessage = userMessage.toLowerCase().trim();
    if(!aiResponses){
        return "I'm still loading my knowledge";
    }

    let matchedCategories = [];
    let matchedKeys = [];

    for(const category in aiResponses){
        if(category === 'default_responses') continue;

        const categoryResponses = aiResponses[category];
        for(const key in categoryResponses){
            if(lowerCaseMessage.includes(key)){
                matchedCategories.push(category);
                matchedKeys.push(key);

                const responses = categoryResponses[key];
                if(Array.isArray(responses) && responses.length > 0){
                    const randomIndex = Math.floor(Math.random() * responses.length);
                    return responses[randomIndex];
                }else if(typeof responses === 'string'){
                    return responses;
                }
            }
        }
    }

    if(matchedCategories.length > 1){
        console.log(`Multiple matches found: ${matchedCategories.join(',')}`);
    }

    if(aiResponses.default_responses && aiResponses.default_responses.length>0){
        const randomIndex = Math.floor(Math.random() * aiResponses.default_responses.length);
        return aiResponses.default_responses[randomIndex];
    }

    return "Thanks for your message! I'm still learning, but I'll do my best to help you. Could you try rephrasing your questions?";
}

function sendMessage(){
    const message = userInput.value.trim();
    if(!message) return;
    addMessage(message, true);
    userInput.value = '';
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        const response = getAIResponse(message);
        addMessage(response);
    }, 800 + Math.random() * 800);
}

function handleKeyPress(event) {  
    if(event.key === "Enter"){
        sendMessage();
    }
}

function suggestQuestion(question){
    userInput.value = question;
    userInput.focus();
}

function clearChat(){
    if(confirm("Are you sure you want to clear the chat?")){
        const messages = chatBox.querySelectorAll('.message');
        for(let i = 1; i<messages.length; i++){
            messages[i].remove();
        }

        hideTypingIndicator();
        setTimeout(()=>{
            addMessage("Chat cleared! How can I help you now?");
        }, 300);
    }
}

window.onload = function(){
    userInput.focus();
    loadAIResponses();
    this.setTimeout(() =>{
        if(aiResponses){
            console.log(`Loaded ${Object.keys(aiResponses).length} response categories`)
        }
    }, 1000);
}