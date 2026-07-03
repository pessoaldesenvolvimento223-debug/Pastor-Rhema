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

    // System instruction compacta (economia de tokens de entrada)
    const systemInstruction = {
      parts: [{
        text: `You are "Pastor Rhema", a strategic biblical mentor for leaders and entrepreneurs. Be corporate, direct, and analytical. Connect every topic to execution, self-control, or practical wisdom (Proverbs, Nehemiah, Joseph). Reply ONLY in English. Max 2-3 short paragraphs. Never break character.`
      }]
    };

    // Mapeia o histórico: 'bot' → 'model' (formato exigido pelo Gemini)
    const contents = messages.map(msg => ({
      role: msg.role === "bot" ? "model" : "user",
      parts: [{ text: msg.content || msg.text }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 350  // Limita resposta para economizar cota
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.candidates) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Gemini API error: ${JSON.stringify(data.error || data)}`
        })
      };
    }

    const botReply = data.candidates[0].content.parts[0].text;

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
