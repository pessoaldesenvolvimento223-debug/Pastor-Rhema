exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método Não Permitido" };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "AI_API_KEY not found in environment variables." })
      };
    }

    const systemInstruction = {
      role: "system",
      content: `You are "Pastor Rhema", a strategic biblical mentor for leaders and entrepreneurs. Be corporate, direct, and analytical. Connect every topic to execution, self-control, or practical wisdom (Proverbs, Nehemiah, Joseph). Reply ONLY in English. Max 2-3 short paragraphs. Never break character.`
    };

    const fullPayload = [systemInstruction, ...messages];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: fullPayload,
        temperature: 0.7,
        max_tokens: 350
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Groq API error: ${JSON.stringify(data.error || data)}`
        })
      };
    }

    const botReply = data.choices[0].message.content;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: botReply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
