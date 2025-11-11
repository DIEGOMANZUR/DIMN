import { GoogleGenAI, Modality } from "@google/genai";
import { type FormData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const generateImage = async (formData: FormData): Promise<string> => {
  const prompt = `
    Create a visually appealing graphic for an Instagram post, with dimensions of 1080x1440 pixels (a 3:4 aspect ratio).

    **Visual Style:**
    - Background Color: ${formData.sheetColor || 'light gray'}
    - Texture/Style: ${formData.texture || 'minimalist and clean'}
    - Other Design Details: ${formData.otherDetails || 'none'}

    **Text Content and Layout:**
    The entire text block must be contained within a safe area, ensuring clear margins from all edges. All text must be strictly left-aligned. Use a clean, modern, and highly readable font.

    **Header (Top Section, smaller text):**
    "${formData.header}"

    **Title (Main Focus, prominent text):**
    - Line 1: "${formData.titleLine1}"
    - Line 2: "${formData.titleLine2}"
    - Line 3: "${formData.titleLine3}"

    **Main Body (Middle Section):**
    Organize the following points clearly, for example with bullet points or subtle separators.
    - Point 1: "${formData.bullet1Line1} ${formData.bullet1Line2} ${formData.bullet1Line3}"
    - Point 2: "${formData.bullet2Line1} ${formData.bullet2Line2} ${formData.bullet2Line3}"
    - Point 3: "${formData.bullet3Line1} ${formData.bullet3Line2} ${formData.bullet3Line3}"
    - Point 4: "${formData.bullet4Line1} ${formData.bullet4Line2} ${formData.bullet4Line3}"

    **Footer (Bottom Section):**
    - "${formData.footer}"

    Generate the image based on these detailed instructions. Do not add any text or elements not specified here.
  `;

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '3:4',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    return response.generatedImages[0].image.imageBytes;
  }
  
  throw new Error("Image generation failed. No images were returned.");
};


export const generateImprovementPrompt = async (formData: FormData): Promise<string> => {
  const prompt = `
    You are a world-class graphic designer and art director. Your task is to generate a clear, direct, and impactful instruction for an image editing AI (Nano Banana). This instruction must creatively enhance an existing Instagram graphic.

    Instead of subtle tweaks, propose a noticeable visual upgrade. Focus on one or two of these areas:
    - **Typography:** Suggest a more dynamic font pairing or a different weight/style for the title to make it pop.
    - **Color Palette:** Propose a complementary accent color or a slight shift in the background hue to improve mood and readability.
    - **Layout:** Suggest a minor adjustment in spacing or alignment to create a better visual flow.
    - **Graphic Elements:** Suggest adding a subtle, non-intrusive graphic element (like a geometric shape, a gradient overlay, or a border) that complements the theme.

    Your output must be ONLY the instruction/prompt itself. Be specific.

    Here is the text content of the graphic:
    - Header: "${formData.header}"
    - Title: "${formData.titleLine1}", "${formData.titleLine2}", "${formData.titleLine3}"
    - Body Point 1: "${formData.bullet1Line1} ${formData.bullet1Line2} ${formData.bullet1Line3}"
    - Body Point 2: "${formData.bullet2Line1} ${formData.bullet2Line2} ${formData.bullet2Line3}"
    - Body Point 3: "${formData.bullet3Line1} ${formData.bullet3Line2} ${formData.bullet3Line3}"
    - Body Point 4: "${formData.bullet4Line1} ${formData.bullet4Line2} ${formData.bullet4Line3}"
    - Footer: "${formData.footer}"

    Example of a strong instruction: "Change the title font to a bold, elegant serif to create more contrast. Introduce a soft gradient to the background using a slightly darker shade of the current color. Add thin, clean lines to separate the bullet points for better organization."

    Generate the enhancement prompt now.
  `;

  // Using Gemini 2.5 Pro for this advanced prompt generation task
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text;
};


export const editImage = async (
  base64Image: string,
  mimeType: string,
  improvementPrompt: string
): Promise<string> => {
  const prompt = `
    You are 'Nano Banana', an advanced image editing AI. You have received an image and a creative directive from an art director. Your mission is to apply this directive to the image.

    **Art Director's Directive:**
    "${improvementPrompt}"

    Execute this directive precisely. You MUST preserve all original text content and its wording. The goal is to visually transform and enhance the existing image according to the directive, not to create a new one from scratch.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };
  
  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', // This is Nano Banana
    contents: { parts: [imagePart, textPart] },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Image editing failed. No image was returned.");
};