type GenerateTextOptions = {
   model?: string;
   prompt: string;
   temperature?: number;
   instructions?: string;
   maxTokens?: number;
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
   }: GenerateTextOptions): Promise<GenerateTextResult> {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
         throw new Error('OPENAI_API_KEY environment variable is required');
      }

      console.log('🤖 Making OpenAI API request with native fetch...');

      const messages = [
         {
            role: 'user' as const,
            content: prompt,
         },
      ];

      if (instructions) {
         messages.unshift({
            role: 'system' as const,
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
         console.log('✅ OpenAI API response received:', {
            id: data.id,
            contentLength: data.choices?.[0]?.message?.content?.length || 0,
         });

         const content = data.choices?.[0]?.message?.content || '';

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
