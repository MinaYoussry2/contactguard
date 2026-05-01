export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { question, result, contractText } = req.body
  if (!question) return res.status(400).json({ error: 'No question provided' })
  try {
    const prompt = `You are a senior contract lawyer specializing in ${result?.jurisdiction || 'UK and US'} law.

Contract findings:
JURISDICTION: ${result?.jurisdiction} - ${result?.jurisdictionReason}
VERDICT: ${result?.verdict}
RISK SCORE: ${result?.score}/10
SUMMARY: ${result?.summary}
KEY RISKS: ${result?.risks?.join('; ')}

CONTRACT EXCERPT:
${contractText?.slice(0, 4000)}

Client question: "${question}"

Answer based on ${result?.jurisdiction || 'applicable'} law. Cite legislation by name. Be direct. End with one clear next step. Under 200 words. Legal information not formal advice.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    const reply = data.content?.map(b => b.text || '').join('') || 'Sorry, could not answer that.'
    res.status(200).json({ reply })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Chat failed. Please try again.' })
  }
}
