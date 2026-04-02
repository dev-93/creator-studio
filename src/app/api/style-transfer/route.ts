import { NextResponse } from 'next/server';
import { generateVisualContent } from '@/lib/gemini';

const FAL_KEY = process.env.FAL_KEY;

export async function POST(request: Request) {
  try {
    const { referenceImages, productImage, productName } = await request.json();

    if (!referenceImages || referenceImages.length === 0) {
      return NextResponse.json({ error: '레퍼런스 이미지가 필요합니다.' }, { status: 400 });
    }

    if (!productImage) {
      return NextResponse.json({ error: '제품 이미지가 필요합니다.' }, { status: 400 });
    }

    // 1. Gemini를 통한 스타일 분석 및 프롬프트 추출
    const styleAnalysisPrompt = `
      당신은 이미지 스타일 분석가입니다. 제공된 여러 레퍼런스 이미지들을 분석하여 공통된 시각적 스타일을 추출하세요.
      다음 요소들을 포함하여 매우 상세한 영어 프롬프트를 작성해주세요:
      - Lighting (soft, moody, dramatic, etc.)
      - Color Palette (vibrant, muted, monochromatic, etc.)
      - Composition (minimalist, overhead, cinematic, etc.)
      - Mood (premium, cozy, retro, futuristic, etc.)
      - Texture & Materials (glossy, matte, wooden, etc.)
      
      결과는 제품명 "${productName || 'product'}"이 이 스타일 내에 조화롭게 배치된 모습을 묘사하는 하나의 완성된 영어 문장이어야 합니다.
      오직 영어 프롬프트만 반환하세요.
    `;

    // 이미지 데이터를 Gemini 형식에 맞게 변환 (base64 string에서 data 부분만 추출)
    const geminiImages = referenceImages.map((img: string) => {
      // data:image/png;base64,iVBORw0KGgo... 형식 대응
      const [mimeInfo, base64Data] = img.includes(',') ? img.split(',') : ['image/jpeg', img];
      const mimeType = mimeInfo.includes(':') ? mimeInfo.split(':')[1].split(';')[0] : 'image/jpeg';
      return {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
    });

    const stylePrompt = await generateVisualContent(styleAnalysisPrompt, geminiImages);

    console.log('Gemini Extracted Style Prompt:', stylePrompt);

    // 2. FAL-AI Nano Banana 2 Edit 모델을 사용한 이미지 생성
    const falResponse = await fetch('https://fal.run/fal-ai/nano-banana-2/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: productImage,
        prompt: stylePrompt,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        sync_mode: true
      })
    });

    if (!falResponse.ok) {
      const errorData = await falResponse.json();
      console.error('FAL API Error:', errorData);
      throw new Error(`FAL API 요청 실패: ${JSON.stringify(errorData)}`);
    }

    const falData = await falResponse.json();
    
    return NextResponse.json({
      success: true,
      stylePrompt,
      generatedImage: falData.images?.[0]?.url || falData.url || null
    });

  } catch (error) {
    console.error('Style Transfer Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
