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
        const total_cost = calculateCost(input_tokens, output_tokens, model_used);

        const { error } = await supabase.from('ai_usage_logs').insert({
            user_id,
            ai_feature,
            input_tokens,
            output_tokens,
            model_used,
            request_duration_ms,
            total_cost
        });

        if (error) console.error('AI Usage Log Error:', error.message);
    } catch (err) {
        console.error('AI Usage Log System Failure:', err.message);
    }
};

/**
 * Calculates the cost of an AI request based on token counts and model pricing.
 */
const calculateCost = (input, output, model) => {
    const pricing = {
        'gemini-1.5-pro': { input: 0.0035 / 1000, output: 0.0105 / 1000 },
        'gemini-1.5-flash': { input: 0.000125 / 1000, output: 0.000375 / 1000 }
    };
    const rate = pricing[model] || pricing['gemini-1.5-flash'];
    return (input * rate.input) + (output * rate.output);
};

/**
 * Performs functional code analysis (Complexity & Security).
 */
const analyzeCode = (code) => {
    // 1. Complexity Analysis (Simplified Halstead/Cyclomatic)
    const lines = code.split('\n').length;
    const tokens = code.match(/[\w$]+/g) || [];
    const uniqueTokens = new Set(tokens).size;
    const cyclomaticHint = (code.match(/(if|for|while|case|\.map|\.filter)/g) || []).length + 1;

    const complexity_score = Math.min(100, (cyclomaticHint * 10) + (uniqueTokens / 20));

    // 2. Security Scan (Pattern Matching)
    const security_issues = [];
    const patterns = [
        { id: 'SEC001', regex: /eval\(|new Function\(/, title: 'Dynamic Code Execution', severity: 'critical' },
        { id: 'SEC002', regex: /innerHTML|outerHTML/, title: 'Potential XSS Vector', severity: 'high' },
        { id: 'SEC003', regex: /password|secret|key|token/i, title: 'Potential Hardcoded Credential', severity: 'medium' },
        { id: 'SEC004', regex: /child_process\.exec|spawn/, title: 'Shell Command Injection Risk', severity: 'critical' }
    ];

    patterns.forEach(p => {
        if (p.regex.test(code)) {
            security_issues.push({ ...p, regex: undefined }); // Remove regex object for JSON
        }
    });

    return {
        complexity_score: parseFloat(complexity_score.toFixed(2)),
        security_issues,
        performance_metrics: {
            token_count: tokens.length,
            unique_token_density: parseFloat((uniqueTokens / tokens.length).toFixed(2)) || 0,
            loc: lines
        }
    };
};

/**
 * Simulated Gemini API call with option support.
 */
const callGemini = async (prompt, options = {}, model = 'gemini-1.5-pro') => {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 800));

    let response = `[AI Response using ${model}]\nProcessed based on: ${prompt.substring(0, 50)}...`;

    if (options.idiomatic) response += "\n\nNote: Applied idiomatic patterns for target language.";
    if (options.preserve_comments) response += "\nNote: All original comments preserved.";

    return {
        text: response,
        input_tokens: Math.floor(prompt.length / 4),
        output_tokens: Math.floor(response.length / 4),
        duration: Date.now() - start
    };
};

module.exports = { logAIUsage, callGemini, analyzeCode, calculateCost };
