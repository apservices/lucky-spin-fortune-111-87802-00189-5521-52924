import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log('AI Chat request received with', messages?.length || 0, 'messages');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // System prompt for the Zodiac Fortune assistant
    const systemPrompt = `Você é um assistente inteligente do jogo Zodiac Fortune, um slot game recreativo brasileiro.

CARACTERÍSTICAS DO JOGO:
- Jogo de slots temático com zodíaco chinês
- Moedas virtuais para entretenimento (+18 anos)
- RTP entre 85-95%
- Sistema de níveis e conquistas
- Recompensas diárias e missões

SUA FUNÇÃO:
1. Responder dúvidas sobre regras, RTP e mecânicas
2. Dar dicas de estratégia (sem garantias de vitória)
3. Explicar conquistas e sistema de progressão
4. Analisar estatísticas do jogador quando fornecidas
5. Motivar e engajar de forma responsável

IMPORTANTE:
- Sempre lembre que é jogo recreativo
- Não garanta vitórias ou padrões
- Incentive jogo responsável
- Use emojis brasileiros (🇧🇷🐅💰)
- Seja amigável, conciso e motivador
- Responda em português brasileiro`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Free until Oct 6, 2025
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Muitas requisições. Aguarde alguns segundos e tente novamente.' 
          }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Créditos de IA esgotados. Entre em contato com o suporte.' 
          }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received successfully');

    return new Response(
      JSON.stringify(data), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar requisição' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
