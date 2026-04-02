import { createFileRoute } from '@tanstack/react-router'
import { GoogleGenAI } from '@google/genai'

const MODEL = 'gemini-2.0-flash'

const categoryDescriptions: Record<string, string> = {
  song: 'song/lyrics with verses and chorus',
  story: 'short story with narrative arc',
  poem: 'poem with poetic structure',
  rhyme: 'rhyme with rhythmic, rhyming lines',
  drama: 'dramatic scene or play excerpt with stage directions',
  speech: 'stage speech or monologue meant to be spoken aloud',
}

const toneDescriptions: Record<string, string> = {
  rabindra:
    "Rabindranath Tagore's lyrical, philosophical, deeply spiritual and nature-inspired style",
  nazrul:
    "Kazi Nazrul Islam's passionate, rebellious, revolutionary and fiery style",
  romantic: 'romantic, tender, passionate and emotionally rich style',
  modern: 'contemporary, modern, minimalist style with fresh perspectives',
  patriotic: 'patriotic, nationalistic, inspiring and proud style',
  humor: 'humorous, witty, light-hearted and comedic style',
  childish: 'child-friendly, simple, playful and innocent style',
}

const lengthGuide: Record<string, string> = {
  short: '80–150 words',
  medium: '250–400 words',
  long: '600–900 words',
}

export const Route = createFileRoute('/api/generate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { prompt, category, tone, length, outputLanguage } = body as {
            prompt: string
            category: string
            tone: string
            length: string
            outputLanguage: string
          }

          if (!prompt || !category || !tone || !length || !outputLanguage) {
            return new Response(
              JSON.stringify({ error: 'Missing required fields' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const ai = new GoogleGenAI({})

          const systemInstruction = `You are a master creative writer with deep knowledge of world literature and multilingual writing.

IMPORTANT: The user has selected the output language as ${outputLanguage}.

STRICT RULE: You MUST write the entire output ONLY in ${outputLanguage}. Do NOT mix any other language. Do NOT translate.

TASK: Write a ${categoryDescriptions[category] || category}.
TONE/STYLE: Write in ${toneDescriptions[tone] || tone}.
LENGTH: Approximately ${lengthGuide[length] || '250–400 words'}.

OUTPUT FORMAT: Provide ONLY the creative writing piece itself. No preamble, no explanation, no extra text.`

TASK: Write a ${categoryDescriptions[category] || category}.
TONE/STYLE: Write in ${toneDescriptions[tone] || tone}.
LENGTH: Approximately ${lengthGuide[length] || '250–400 words'}.

CRITICAL LANGUAGE RULE: You MUST write the entire output ONLY in ${outputLanguage}. This is non-negotiable. Do not mix languages. Do not add translations.

OUTPUT FORMAT: Provide ONLY the creative writing piece itself. No preamble, no explanation, no title unless it is a natural part of the piece, no commentary after the piece.`

          const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.9,
              maxOutputTokens: 1500,
            },
          })

          return Response.json({ text: response.text ?? '' })
        } catch (error: any) {
          console.error('Generate error:', error)
          return new Response(
            JSON.stringify({
              error: 'Failed to generate content',
              message: error.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
