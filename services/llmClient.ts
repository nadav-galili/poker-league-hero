import OpenAI from 'openai';

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

      const client = new OpenAI({
         apiKey,
      });

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

      const response = await client.chat.completions.create({
         model,
         messages,
         temperature,
         max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
         id: response.id,
         text: content,
      };
   },
};
