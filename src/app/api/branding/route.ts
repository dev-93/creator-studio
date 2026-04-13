import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';

export async function POST(request: Request) {
  const FAL_KEY = process.env.FAL_KEY;

  if (!FAL_KEY) {
    return NextResponse.json({ error: 'FAL AI 인증 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    console.log('--- AI Product Branding Started ---');
    const { productImage, productName, brandStyle } = await request.json();

    if (!productImage) {
      return NextResponse.json({ error: '제품 이미지가 필요합니다.' }, { status: 400 });
    }

    // 1. 광고 전문가 에이전트 — 3장 세트 프롬프트 생성
    console.log('Ad Creative Director Agent starting...');

    const adDirectorPrompt = `당신은 세계적인 광고 에이전시의 크리에이티브 디렉터이자 상업 사진 감독입니다.
제품명: "${productName || '제품'}"
${brandStyle ? `클라이언트 요청 스타일: "${brandStyle}"` : ''}

[카테고리별 촬영 전문 지식]
제품명을 분석하여 가장 적합한 카테고리를 자동 판단하고, 해당 지식을 반영하세요.

[스킨케어/화장품]
- 조명: 소프트 디퓨즈드, 광택과 텍스처를 살리는 하이라이트
- 배경: 대리석, 리넨, 물방울, 식물, 단색
- 구도: 클로즈업, 손 홀딩, 텍스처 발림, 플랫레이
- 핵심: 고급스러움, 청결감, 자연스러움

[식품/음료/간식]
- 조명: 자연광, 밝고 선명, 따뜻한 톤
- 배경: 나무 테이블, 주방, 야외, 카페
- 구도: 탑다운, 45도, 단면, 원재료 배치
- 핵심: 먹음직스러움, 신선함

[패션/신발/액세서리]
- 조명: 에디토리얼, 자연광~스튜디오 믹스, 소재 질감 강조
- 배경: 도시 거리, 스튜디오, 인테리어, 자연
- 구도: 착용샷, 스틸라이프, 액션샷
- 핵심: 스타일, 라이프스타일, 소재감

[전자기기/테크]
- 조명: 클린 모던, 림라이트, 반사 제어
- 배경: 미니멀 데스크, 다크, 그라데이션, 화이트
- 구도: 히어로샷, 사용 중, 디테일 매크로
- 핵심: 프리미엄, 정밀함, 미래지향

[반려동물 용품]
- 조명: 따뜻한 자연광
- 배경: 거실, 잔디, 깨끗한 바닥
- 구도: 단독, 사용 모습, 보호자 손
- 핵심: 신뢰감, 안전, 사랑스러움

[작업 지시]
1단계: 제품 카테고리를 자동 판단하세요.
2단계: 이 제품을 위한 3장 세트 캠페인 촬영 프롬프트를 작성하세요.

3장은 각각 다른 컨셉이어야 합니다:
- shot1 (착용/사용): 모델이 제품을 실제로 착용하거나 사용하는 라이프스타일 샷. 자연스러운 일상 속 모습.
- shot2 (제품 히어로): 제품 자체가 주인공인 스틸라이프. 소재감, 디테일, 형태를 극대화. 모델 없이 제품만.
- shot3 (무드/컨텍스트): 제품이 속한 세계관을 보여주는 무드샷. 공간, 소품, 색감으로 브랜드의 감성과 세계관을 전달. 제품은 화면의 일부로 자연스럽게 배치.

각 프롬프트에 반드시 포함:
- "professional commercial product photography, editorial quality, shot on medium format camera"
- 제품 형태와 디테일을 정확히 유지하라는 지시
- 구체적인 배경, 조명, 색감, 카메라 앵글 지정

3단계: 인스타그램 마케팅 가이드 (간결하게)

반드시 아래 JSON 형식으로만 답변하세요:
{
  "category": "자동 판단된 카테고리",
  "concept": "캠페인 컨셉 한줄 요약 (한국어)",
  "shots": [
    { "type": "착용/사용", "prompt": "영어 프롬프트" },
    { "type": "제품 히어로", "prompt": "영어 프롬프트" },
    { "type": "무드/컨텍스트", "prompt": "영어 프롬프트" }
  ],
  "marketingGuide": "인스타 업로드 가이드 (한국어, 간결하게)"
}`;

    const agentResponse = await generateContent(adDirectorPrompt, true);
    const { category, concept, shots, marketingGuide } = JSON.parse(agentResponse);

    console.log('Category:', category);
    console.log('Concept:', concept);
    shots.forEach((s: { type: string; prompt: string }, i: number) => console.log(`Shot ${i + 1} (${s.type}):`, s.prompt.substring(0, 80) + '...'));

    // 2. FAL-AI 3장 병렬 생성
    console.log('FAL-AI generating 3 shots...');
    const falPromises = shots.map((shot: { type: string; prompt: string }) =>
      fetch('https://fal.run/fal-ai/nano-banana-2/edit', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_urls: [productImage],
          prompt: shot.prompt,
          aspect_ratio: "4:5",
          resolution: "1K",
          num_inference_steps: 28,
          guidance_scale: 7.5,
          sync_mode: true
        })
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          console.error(`FAL Error (${shot.type}):`, err);
          return null;
        }
        const data = await res.json();
        return {
          type: shot.type,
          prompt: shot.prompt,
          image: data.images?.[0]?.url || data.url || null
        };
      }).catch((err) => {
        console.error(`FAL Exception (${shot.type}):`, err);
        return null;
      })
    );

    const results = await Promise.all(falPromises);
    const generatedShots = results.filter(Boolean);
    console.log(`FAL-AI completed: ${generatedShots.length}/3 shots`);

    return NextResponse.json({
      success: true,
      category,
      concept,
      shots: generatedShots,
      marketingGuide,
    });

  } catch (error) {
    console.error('Branding Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
