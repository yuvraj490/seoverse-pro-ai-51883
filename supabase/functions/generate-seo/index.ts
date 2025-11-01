import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, type, platform, duration } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check credits
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Determine credit cost based on type
    let creditCost = 1;
    if (type === 'script' && duration) {
      creditCost = parseInt(duration) || 5;
    }

    if (profile.credits < creditCost) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare prompts based on type
    let systemPrompt = 'You are an SEO expert. Generate comprehensive SEO content. IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, only JSON.';
    let userPrompt = topic;
    let maxTokens = 1024;
    
    if (type === 'script') {
      systemPrompt = `You are a professional video script writer. Create a ${duration}-minute video script with: opening hook, main points with timing, smooth transitions, and a strong closing CTA. Make it engaging, natural, and well-structured. Return as plain text, not JSON.`;
      userPrompt = topic;
      maxTokens = duration === '15' ? 2048 : duration === '10' ? 1536 : 1024;
    } else if (type === 'ideas') {
      systemPrompt = 'You are a creative content strategist. Generate 10 unique, trending video ideas. Make each idea specific, actionable, and attention-grabbing. Format as a numbered list.';
      userPrompt = topic;
    } else if (type === 'hashtags') {
      systemPrompt = 'You are a social media expert. Generate 30 relevant hashtags (including # symbol). Mix popular and niche tags. IMPORTANT: Return ONLY valid JSON with this exact structure: {"hashtags":["#example1","#example2"]}. No markdown, no explanation, only JSON.';
      userPrompt = topic;
    } else if (type === 'captions') {
      systemPrompt = `You are a ${platform || 'Instagram'} copywriter. Generate 5 engaging captions with emojis and CTAs optimized for ${platform || 'Instagram'}. IMPORTANT: Return ONLY valid JSON with this exact structure: {"captions":["caption 1","caption 2"]}. No markdown, no explanation, only JSON.`;
      userPrompt = topic;
    } else if (type === 'trends') {
      // Use Groq API for trends
      const groqApiKey = Deno.env.get('GROQ_API_KEY');
      if (!groqApiKey) {
        throw new Error('GROQ_API_KEY not configured');
      }

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { 
              role: 'system', 
              content: 'You are a trend analyst. Analyze trending topics related to the user query. IMPORTANT: Return ONLY valid JSON with this exact structure: {"trends":[{"topic":"topic name","score":"hot|rising|stable","insights":"analysis"}]}. No markdown, no explanation, only JSON.' 
            },
            { role: 'user', content: `Analyze 5 trending topics for: ${topic}` }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: "json_object" }
        }),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, errorText);
        throw new Error('Trend analysis failed');
      }

      const groqData = await groqResponse.json();
      const groqContent = groqData.choices[0]?.message?.content?.trim();
      
      if (!groqContent) {
        throw new Error('No content generated from Groq');
      }

      // Deduct 5 credits for trend analysis
      const trendCreditCost = 5;
      
      if (profile.credits < trendCreditCost) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let parsed;
      try {
        // Try to extract JSON from markdown code blocks if present
        let jsonContent = groqContent;
        const jsonMatch = groqContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        parsed = JSON.parse(jsonContent);
      } catch (e) {
        console.error('Failed to parse Groq response:', groqContent);
        throw new Error('Invalid AI response format: ' + (e instanceof Error ? e.message : 'Unknown error'));
      }

      // Deduct credits
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ credits: profile.credits - trendCreditCost })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to deduct credits:', updateError);
      }

      return new Response(
        JSON.stringify({
          ...parsed,
          creditsRemaining: profile.credits - trendCreditCost
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      systemPrompt = 'You are an SEO assistant. Generate comprehensive SEO content. IMPORTANT: Return ONLY valid JSON with these exact keys: {"title":"...","description":"... (200 chars YouTube description)","tags":["tag1","tag2",...],"keywords":["keyword1","keyword2",...],"meta_description":"... (160 chars)"}. No markdown, no explanation, only JSON.';
      userPrompt = topic;
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service payment required. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content?.trim();
    
    if (!content) {
      console.error('Empty content from AI');
      throw new Error('No content generated');
    }

    console.log('AI Response content:', content.substring(0, 200));

    // Handle different response types
    if (type === 'hashtags' || type === 'captions') {
      let parsed;
      try {
        // Try to extract JSON from markdown code blocks if present
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        parsed = JSON.parse(jsonContent);
      } catch (e) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid AI response format: ' + (e instanceof Error ? e.message : 'Unknown error'));
      }
      
      // These types don't deduct credits
      return new Response(
        JSON.stringify(parsed),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'script' || type === 'ideas') {
      // Deduct credits based on cost
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ credits: profile.credits - creditCost })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to deduct credits:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          description: content,
          creditsRemaining: profile.credits - creditCost 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default SEO generation
    let parsed;
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      parsed = JSON.parse(jsonContent);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }

    const { title, description, tags, keywords, meta_description } = parsed;

    // Deduct credit
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ credits: profile.credits - creditCost })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to deduct credits:', updateError);
    }

    // Save generation
    const { error: saveError } = await supabaseClient
      .from('generations')
      .insert({
        user_id: user.id,
        topic,
        title,
        description,
        tags: Array.isArray(tags) ? tags : [],
        keywords: Array.isArray(keywords) ? keywords : [],
        meta_description,
      });

    if (saveError) {
      console.error('Failed to save generation:', saveError);
    }

    return new Response(
      JSON.stringify({ 
        title,
        description, 
        tags: Array.isArray(tags) ? tags : [], 
        keywords: Array.isArray(keywords) ? keywords : [],
        meta_description,
        creditsRemaining: profile.credits - creditCost 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});