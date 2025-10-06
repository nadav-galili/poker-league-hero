import OpenAI from 'openai';

type GenerateTextOptions = {
   model?: string;
   prompt: string;
   temperature?: number;
   instructions?: string;
   maxTokens?: number;
   apiKey: string;
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
      apiKey,
   }: GenerateTextOptions): Promise<GenerateTextResult> {
      const client = new OpenAI({
         apiKey: apiKey,
      });

      const response = await client.responses.create({
         model,
         input: prompt,
         instructions,
         temperature,
         max_output_tokens: maxTokens,
      });
      return {
         id: response.id,
         text: response.output_text,
      };
   },
};
