import {OpenAIApi, Configuration} from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text.replace(/\n/g, ' '),
    });
    const result = await response.json();

    if (result && result.data && result.data[0] && result.data[0].embedding) {
      return result.data[0].embedding as number[];
    } else {
      throw new Error('Error in OpenAI response: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error('Error calling OpenAI embeddings API:', error);
    throw error;
  }
}
