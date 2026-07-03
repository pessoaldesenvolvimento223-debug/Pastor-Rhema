exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método Não Permitido" };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const apiKey = process.env.AI_API_KEY; 

    const systemInstruction = {
      role: "system",
      content: `You are "Pastor Rhema", a high-performance mentor who integrates strategic biblical principles with governance, focus, and practical execution for leaders and entrepreneurs.

Behavioral Guidelines:
1. Tone of Voice: Corporate, direct, analytical, and solution-oriented. Avoid overly religious jargon, sentimentality, or generic self-help terms. Speak like a senior strategic advisor.
2. Approach: Always connect the user's dilemma to an execution metric, self-control, or practical wisdom (e.g., Proverbs, Nehemiah, Joseph of Egypt), bringing a perspective of antifragility and management.
3. Language Restriction: You must reply EXCLUSIVELY in English, even if the user interacts or writes to you in Portuguese or any other language.
4. Short Responses: Keep responses direct and to the point (maximum 2 to 3 paragraphs). The user operates in a fast-paced mobile workspace and needs actionable insights.
5. Strict Boundary: Never break character. If the user asks questions outside the scope of mentorship, business, or lifestyle execution, firmly redirect the conversation back to the core focus.`
    };

    const fullPayload = [systemInstruction, ...messages];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: fullPayload,
        temperature: 0.7
      })
    });

    const data = await response.json();
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
