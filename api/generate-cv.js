// api/generate-cv.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, model, temperature, max_tokens } = req.body;

        // Get API key from environment variable
        const OR_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!OR_API_KEY) {
            return res.status(500).json({ 
                error: 'API key not configured on server' 
            });
        }

        // Forward request to OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OR_API_KEY}`,
                'HTTP-Referer': 'https://a-i-cv-generator.vercel.app',
                'X-Title': 'CV Generator'
            },
            body: JSON.stringify({
                model: model || 'meta-llama/llama-3.1-8b-instruct',
                messages: messages,
                temperature: temperature || 0.7,
                max_tokens: max_tokens || 8000
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || 'API request failed' 
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: error.message || 'Internal server error' 
        });
    }
}