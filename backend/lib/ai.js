const { supabase } = require('../middleware/auth');

/**
 * Logs AI feature usage to the ai_usage_logs table.
 */
const logAIUsage = async ({
    user_id,
    ai_feature,
    input_tokens,
    output_tokens,
    model_used,
    request_duration_ms
}) => {
    try {
        const { error } = await supabase.from('ai_usage_logs').insert({
            user_id,
            ai_feature,
            input_tokens,
            output_tokens,
            model_used,
            request_duration_ms,
            total_cost: ((input_tokens + output_tokens) / 1000) * 0.002 // Simulated cost calculation
        });

        if (error) console.error('AI Usage Log Error:', error.message);
    } catch (err) {
        console.error('AI Usage Log System Failure:', err.message);
    }
};

/**
 * Simulated Gemini API call.
 * In a real environment, this would use @google/generative-ai
 */
const callGemini = async (prompt, model = 'gemini-1.5-pro') => {
    const start = Date.now();
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple response generation logic for simulation
    const response = `[AI Response using ${model}]\nProcessed based on: ${prompt.substring(0, 50)}...`;

    return {
        text: response,
        input_tokens: Math.floor(prompt.length / 4),
        output_tokens: Math.floor(response.length / 4),
        duration: Date.now() - start
    };
};

module.exports = { logAIUsage, callGemini };
