export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { contractText, userId } = req.body
  if (!contractText) return res.status(400).json({ error: 'No contract text provided' })
  
  console.log('=== DEBUG INFO ===')
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
  console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0)
  console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY?.substring(0, 15) || 'EMPTY')
  console.log('==================')
  
  try {
    const prompt = `You are a highly experienced contract lawyer with 20+ years in UK and US law.

STEP 1 - AUTO-DETECT JURISDICTION from: governing law clauses, currency (GBP=UK, USD=US), legal terms (solicitor/barrister=UK, attorney=US), company formats (Ltd/PLC=UK, Inc/LLC=US).

STEP 2 - APPLY EXACT LAWS: UK: Consumer Rights Act 2015, Unfair Contract Terms Act 1977, Employment Rights Act 1996. US: relevant state law, UCC, FTC regulations.

STEP 3 - FULL ANALYSIS. Respond ONLY with valid JSON, no markdown:
{
  "jurisdiction": "UK or US or US-California etc",
  "jurisdictionReason": "one sentence how detected",
  "summary": "comprehensive plain English explanation",
  "score": 7,
  "verdict": "one clear verdict sentence",
  "clauses": [
    {
      "title": "clause name",
      "status": "risk",
      "plainEnglish": "what it means simply",
      "legalAnalysis": "what the law says, cite act by name",
      "yourRights": "exact rights under this jurisdiction",
      "negotiationTip": "specific language to use"
    }
  ],
  "risks": ["risk 1","risk 2","risk 3","risk 4"],
  "suggestions": ["suggestion 1","suggestion 2","suggestion 3","suggestion 4"],
  "legalComparison": [
    {"status":"warn","text":"deviation from standard"},
    {"status":"ok","text":"meets standard requirements"}
  ],
  "overallAdvice": "sign negotiate or walk away with reasoning"
}

CONTRACT:
${contractText.slice(0, 12000)}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    console.log('Anthropic response status:', response.status)
    console.log('Anthropic response data:', JSON.stringify(data))
    const raw = data.content?.map(b => b.text || '').join('') || ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    if (userId) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET)
      await supabase.from('analyses').insert({ user_id: userId, result, created_at: new Date().toISOString() })
    }
    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
}
