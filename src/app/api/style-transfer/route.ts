import { NextResponse } from 'next/server';
import { generateVisualContent } from '@/lib/gemini';

export async function POST(request: Request) {
  const FAL_KEY = process.env.FAL_KEY;
  
  if (!FAL_KEY) {
    console.error('FAL_KEY is not defined in environment variables.');
    return NextResponse.json({ error: 'FAL AI 인증 키가 설정되지 않았습니다. 배포 설정(Vercel)을 확인해주세요.' }, { status: 500 });
  }

  try {
    console.log('--- Style Transfer Started ---');
    const { referenceImages, productImage, productName } = await request.json();
    console.log(`Payload received: ${referenceImages.length} refs, 1 prod`);

    if (!referenceImages || referenceImages.length === 0) {
      return NextResponse.json({ error: '레퍼런스 이미지가 필요합니다.' }, { status: 400 });
    }

    if (!productImage) {
      return NextResponse.json({ error: '제품 이미지가 필요합니다.' }, { status: 400 });
    }

    // 1. Gemini를 통한 전문 스타일 분석 (원본 프로젝트 스타일 체계 적용)
    console.log('Gemini precision analysis starting...');
    const styleAnalysisPrompt = `
      당신은 세계 최고의 광고 이미지 스타일 전문가입니다. 제공된 레퍼런스 이미지들의 DNA를 다음 7가지 핵심 차원에서 분석하여 하나의 강력한 명령(Instruction) 프롬프트를 작성하세요:
      1. Camera & Lens (e.g., fisheye, 35mm movie camera, macro)
      2. Camera Angle & Shot Type (e.g., extreme low-angle, top-down overhead, cinematic eye-level)
      3. Color Palette & Lighting (e.g., golden hour warm light, moody dramatic shadows, vibrant neon)
      4. Composition & Framing (e.g., minimalist centered, dynamic rule of thirds, clean negative space)
      5. Mood & Energy (e.g., raw urban energy, premium luxury, cozy Scandinavian)
      6. Texture & Materials (e.g., wet concrete, smooth velvet, rustic wood)
      7. Overall Scene Context (e.g., studio editorial, real-world street lifestyle)
      
      반드시 다음 형식을 엄격히 따르세요:
      "transform into [분석한 스타일 키워드들의 고밀도 조합], maintaining the product shape and details exactly"
      
      결과는 오직 영어로 된 하나의 명령 문장이어야 합니다. 다른 설명은 생략하세요.
    `;

    // 이미지 데이터를 Gemini 형식에 맞게 변환
    const geminiImages = referenceImages.map((img: string) => {
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
    console.log('Gemini Analyzed Instruction:', stylePrompt);

    // 2. FAL-AI Nano Banana 2 Edit 모델 호출 (원본 프로젝트의 고품질 규격 반영)
    console.log('FAL-AI generation starting (1K High Quality)...');
    const falResponse = await fetch('https://fal.run/fal-ai/nano-banana-2/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_urls: [productImage],
        prompt: stylePrompt,
        aspect_ratio: "4:5",
        resolution: "1K",
        num_inference_steps: 25, // 품질 보존을 위해 25단계 복구
        guidance_scale: 7.5,
        sync_mode: true
      })
    });
    console.log('FAL-AI raw response received.');

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
