const OpenAI = require('openai');
const ChatSummary = require('../models/chat');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `You are a helpful medical assistant AI for DoctAid. 
You have been provided with the following patient information:
Age: {age}
Gender: {gender}
Weight: {weight}kg
Height: {height}cm

Please take this information into account when providing medical guidance.

Your role is to provide general medical information and guidance while being clear that:
1. You are not a replacement for professional medical advice
2. For specific medical concerns, users should consult their healthcare provider
3. In emergencies, users should seek immediate medical attention

Focus on:
- Providing evidence-based medical information
- Explaining medical terms in simple language
- Offering general wellness and preventive health advice
- Helping users understand common medical conditions
- Suggesting when to seek professional medical help

Always maintain a professional, empathetic, and helpful tone.
Format your responses using markdown for better readability.`;

exports.processMessage = async (req, res) => {
    try {
        const { message, userInfo } = req.body;

        if (!userInfo || !message) {
            return res.status(400).json({ error: 'Both message and user info are required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key is not configured' });
        }

        const customizedPrompt = systemPrompt
            .replace('{age}', userInfo.age)
            .replace('{gender}', userInfo.gender)
            .replace('{weight}', userInfo.weight)
            .replace('{height}', userInfo.height);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: customizedPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = response.choices[0].message.content;

        return res.json({
            response: aiResponse
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return res.status(500).json({
            error: error.message || 'An error occurred while processing your request'
        });
    }
};

exports.generateSummary = async (req, res) => {
    try {
        const { userInfo, conversation } = req.body;

        if (!userInfo || !conversation || !Array.isArray(conversation)) {
            return res.status(400).json({ error: 'User info and conversation are required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key is not configured' });
        }

        const conversationText = conversation
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n\n');

        const summaryResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Generate a concise medical summary of the following conversation for a doctor's reference. Include key symptoms, concerns, and any relevant medical history discussed."
                },
                {
                    role: "user",
                    content: conversationText
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const summary = summaryResponse.choices[0].message.content;

        // Store only the summary in database
        await ChatSummary.findOneAndUpdate(
            { userInfo },
            { 
                userInfo,
                summary
            },
            { upsert: true, new: true }
        );

        return res.json({ summary });

    } catch (error) {
        console.error('Summary Generation Error:', error);
        return res.status(500).json({
            error: error.message || 'An error occurred while generating the summary'
        });
    }
};