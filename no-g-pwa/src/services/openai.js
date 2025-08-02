import axios from 'axios';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Convert image file to base64
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data:image/jpeg;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Analyze image using GPT-4 Vision
export const analyzeImage = async (imageFile, allergens) => {
  try {
    const base64Image = await convertToBase64(imageFile);
    
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing food ingredient labels for allergens. Provide clear, accurate analysis."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this ingredient label for the following allergens: ${allergens.join(', ')}.
                
                Respond in this exact JSON format:
                {
                  "status": "SAFE" or "UNSAFE" or "UNCERTAIN",
                  "flaggedIngredients": ["ingredient1", "ingredient2"],
                  "explanation": "Brief explanation of why it's safe/unsafe",
                  "extractedText": "The full ingredient list extracted from the image"
                }
                
                Be thorough but concise. If you can't read the image clearly, mark as UNCERTAIN.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.choices[0].message.content;
    try {
      return JSON.parse(result);
    } catch (e) {
      // If JSON parsing fails, return a structured response
      return {
        status: "UNCERTAIN",
        flaggedIngredients: [],
        explanation: "Unable to parse the analysis. Please try again.",
        extractedText: result
      };
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

// Analyze text using GPT-4
export const analyzeText = async (ingredientText, allergens) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing food ingredients for allergens. Provide clear, accurate analysis."
          },
          {
            role: "user",
            content: `Analyze this ingredient list for ${allergens.join(', ')}: "${ingredientText}"
            
            Respond in this exact JSON format:
            {
              "status": "SAFE" or "UNSAFE" or "UNCERTAIN",
              "flaggedIngredients": ["ingredient1", "ingredient2"],
              "explanation": "Brief explanation of why it's safe/unsafe"
            }
            
            Consider hidden sources of allergens and cross-contamination warnings.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.choices[0].message.content;
    try {
      return JSON.parse(result);
    } catch (e) {
      // If JSON parsing fails, return a structured response
      return {
        status: "UNCERTAIN",
        flaggedIngredients: [],
        explanation: "Unable to parse the analysis. Please try again."
      };
    }
  } catch (error) {
    console.error('Error analyzing text:', error);
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    throw new Error('Failed to analyze ingredients. Please try again.');
  }
};

// Retry logic with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};