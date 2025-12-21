type GenerateTextOptions = {
   model?: string;
   prompt: string;
   temperature?: number;
   instructions?: string;
   maxTokens?: number;
   responseFormat?: { type: 'text' | 'json_object' };
};

type GenerateTextResult = {
   id: string;
   text: string;
};

// Use native fetch API for Cloudflare Workers compatibility
export const llmClient = {
   async generateText({
      model = 'gpt-4o-mini',
      prompt,
      instructions,
      temperature = 0.2,
      maxTokens = 500,
      responseFormat,
   }: GenerateTextOptions): Promise<GenerateTextResult> {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
         throw new Error('OPENAI_API_KEY environment variable is required');
      }

      const messages = [
         {
            role: 'user' as const,
            content: prompt,
         },
      ];

      if (instructions) {
         messages.unshift({
            role: 'user' as const,
            content: instructions,
         });
      }

      try {
         const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
               },
               body: JSON.stringify({
                  model,
                  messages,
                  temperature,
                  max_tokens: maxTokens,
                  response_format: responseFormat,
               }),
            }
         );

         if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OpenAI API error:', response.status, errorText);
            throw new Error(
               `OpenAI API error: ${response.status} ${errorText}`
            );
         }

         const data = await response.json();
         const content = data.choices?.[0]?.message?.content || '';

         console.log('✅ OpenAI API response received:', {
            id: data.id,
            model: data.model,
            contentLength: content.length,
            finishReason: data.choices?.[0]?.finish_reason,
            contentPreview: content.substring(0, 200),
         });

         return {
            id: data.id || 'unknown',
            text: content,
         };
      } catch (error) {
         console.error('❌ Error in OpenAI fetch call:', error);
         throw error;
      }
   },
};
