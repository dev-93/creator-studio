import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import fs from 'fs';
import path from 'path';

interface Scene {
  sceneNumber: number;
  description: string;
}

const AGENT_PROMPTS = {
  theme: (trends: string) => `당신은 유튜브 쇼츠 주제 추천 전문가입니다. 
아이들이 "왜 하면 안 되는지 모르는 행동"을 소재로 부모는 교육 효과를, 아이들은 재미를 느낄 수 있는 글로벌 타겟 주제 5가지를 생성하세요.

[중요] 아래 제공된 '최근 트렌드 데이터'의 키워드들을 직접적으로 활용하여 주제를 선정하세요.

최근 트렌드 데이터 (참고용):
${trends}

조건:
1. 형식: 반드시 "왜 ~하면 안돼?" 또는 "절대 ~하면 안 되는 이유" 형태를 고수하세요.
2. 소재: 위 트렌드 데이터의 키워드를 적극 활용하여 '안전'과 '과학적 이유'가 결합된 소재 우선.
3. 의외성: 금지/경고 뒤에 숨겨진 의외의 사실이나 섬뜩하지만 유익한 과학적 근거를 포함하세요. (3~7세 타겟이지만 어른도 "진짜?" 할 만한 포인트 필수)
4. 타겟: 부모가 아이에게 보여주고 싶고, 아이들이 스스로 보고 싶어 하는 B급 감성 교육 콘텐츠.
5. 차별화: 단순 지식 전달이 아닌, 시각적 충격을 줄 수 있는 '이유'가 명확한 주제를 선정하세요.

결과는 반드시 JSON 형식으로 반환하세요.
형식: { "themes": ["주제1", "주제2", "주제3", "주제4", "주제5"] }`,

  scenario: (theme: string) => `당신은 할리우드 출신의 '시각적 스토리텔러'이자 B급 감성 애니메이션 감독입니다.
주제: "${theme}"

에피소드 구조 (반드시 준수):
1. 상황(Situation): 캐릭터가 특정 장소(예: 등산로)에 있음.
2. 행동(Action): 캐릭터가 금지된 행동을 하려고 함(예: 너구리를 만지려 함), 호기심 가득한 표정.
3. 결과(Result): 그 행동의 위험성/과학적 이유를 과장되게 시각화(예: 너구리 입속 바이러스가 괴물처럼 변함), 캐릭터의 절망적이고 킹받는 표정.
4. 마무리(X-mark): 화면 중앙에 커다란 빨간색 X 표시와 함께 종료.

캐릭터 및 스타일 지침:
- 캐릭터: 단순하고 못생긴 듯 귀여운(Ugly-cute) 스타일, 표정이 과장되고 킹받는(Annoying-but-funny) 느낌.
- 무대사: 전 세계 누구나 이해할 수 있게 대사 없이 오직 행동과 표정, 효과음 위주로 구성하세요.
- 시각화: 과학적 근거/이유를 시각적으로 매우 강력하고 과장되게 묘사하세요.

결과는 반드시 JSON 형식으로 반환하세요.
형식: { "scenes": [ { "sceneNumber": 1, "description": "디테일한 시각적 및 캐릭터 표정 묘사" }, ... ] }`,

  kling: (scenes: Scene[]) => `당신은 Kling AI 전문 '프롬프트 엔지니어'입니다. 
다음 시나리오를 B급 감성의 'Ugly-cute' 3D/2D 하이브리드 애니메이션 스타일 영어 프롬프트로 변환하세요.

프롬프트 필수 요소:
- Style: B-grade aesthetic, "Ugly-cute" character design, vibrant but slightly offbeat colors, exaggerated facial expressions (annoying but funny).
- Visuals: Macro view of viruses/bacteria, high-contrast, bright red background for "X" mark.
- Camera: Dynamic angles, close-ups on exaggerated expressions, handheld camera shake.
- Technical: 8k, high quality, masterpiece, expressive animations, 3D render style but with flat textures.
스토리보드: ${JSON.stringify(scenes)}

결과는 반드시 JSON 형식으로 반환하세요.
형식: { "prompts": [ { "sceneNumber": 1, "englishPrompt": "Scientific and artistic English prompt here" }, ... ] }`,

  marketing: (theme: string) => `당신은 유튜브 쇼츠 알고리즘을 최적화하는 '마케팅 전문가'입니다.
주제: "${theme}"의 CTR(클릭률)과 시청 지속 시간을 극대화하기 위한 마케팅 에셋을 구성하세요.

작업 내용:
1. 고효율 제목: "절대 하지 마세요", "진짜 이유", "당신만 모르는 사실" 등 호기심을 자극하는 강렬한 제목과 이모지.
2. 타겟팅 해시태그: 주제와 관련된 핵심 해시태그와 #Shorts 등 공통 해시태그를 포함한 30개.
3. 참여 유도 설명: 시청자와의 소통을 유도하고 구독을 제안하는 구조화된 설명글.

결과는 반드시 JSON 형식으로 반환하세요.
형식: { "title": "제목", "hashtags": "해시태그1 #해시태그2 ...", "description": "구조화된 설명" }`,

  card_trends: () => `너는 인스타그램 카드뉴스 트렌드 전문가야.
요즘 사람들이 관심 갖는 AI, 테크, 글로벌 이슈 중에서 
인스타그램 카드뉴스로 만들면 저장율이 높을 주제 3개를 추천해줘.
각 주제는 제목(30자 이내), 한줄설명(50자 이내), 카테고리(AI/테크/이슈 중 하나)로 구성.
반드시 JSON 배열로만 응답. 다른 텍스트 없이.
형식: [{"title":"...","description":"...","category":"..."}]`,

  card_writer: (topic: string) => `너는 인스타그램 카드뉴스 전문 작가야.
주어진 주제 "${topic}"으로 카드뉴스 5장 텍스트를 작성해줘.
카드 구성:
- 1장: 후킹 제목 (30자 이내) + 부제목 (40자 이내)
- 2장: 핵심 데이터나 사실 1개 + 설명 2줄
- 3장: 핵심 인사이트 1개 + 설명 2줄
- 4장: 실제 사례나 현실 상황 + 설명 2줄
- 5장: 독자 댓글 유도 질문 + 다음편 예고 한줄
톤: 친근하고 쉽게, 20-30대가 읽기 편한 문체.
반드시 JSON으로만 응답. 다른 텍스트 없이.
형식: 
[
  {"card":1,"title":"...","subtitle":"..."},
  {"card":2,"title":"...","body":"..."},
  {"card":3,"title":"...","body":"..."},
  {"card":4,"title":"...","body":"..."},
  {"card":5,"question":"...","preview":"..."}
]`,

  card_image: (cards: Array<Record<string, unknown>>) => `너는 인스타그램 카드뉴스 이미지 디렉터야.
카드뉴스 5장 내용 ${JSON.stringify(cards)}을 보고 각 카드에 어울리는 이미지 프롬프트를 영어로 작성해줘.
ImageFX 또는 Midjourney에서 바로 사용 가능한 프롬프트.
저작권 문제 없는 스톡 이미지 스타일.
각 프롬프트 2줄 이내.
반드시 JSON으로만 응답. 다른 텍스트 없이.
형식:
[
  {"card":1,"prompt":"...","style":"photo"},
  {"card":2,"prompt":"...","style":"illustration"},
  {"card":3,"prompt":"...","style":"photo"},
  {"card":4,"prompt":"...","style":"illustration"},
  {"card":5,"prompt":"...","style":"photo"}
]`,

  card_marketer: (topic: string, cards: Array<Record<string, unknown>>) => `너는 인스타그램 마케터야.
주제 "${topic}"과 카드뉴스 내용 ${JSON.stringify(cards)}을 보고 게시물 캡션과 해시태그를 작성해줘.
캡션: 첫 줄 후킹 문장 + 3-4줄 핵심 요약 + 마지막 질문.
해시태그: 15개 이내, 한국어+영어 혼합, 이모지 자연스럽게 포함.
반드시 JSON으로만 응답. 다른 텍스트 없이.
형식: {"caption":"...","hashtags":"#... #..."}`
};

export const POST = async (request: Request) => {
  try {
    const { step, theme, scenes, topic, cards } = await request.json();

    let prompt = '';
    switch (step) {
      case 'theme':
        let trendsContent = '';
        try {
          const trendsPath = path.join(process.cwd(), 'data/trends.json');
          if (fs.existsSync(trendsPath)) {
            const rawTrends = fs.readFileSync(trendsPath, 'utf8');
            const trendsArr = JSON.parse(rawTrends);
            trendsContent = trendsArr.map((t: { keyword: string; description: string }) => `- ${t.keyword}: ${t.description}`).join('\n');
          }
        } catch (e) {
          console.error("Failed to read trends file", e);
        }
        prompt = AGENT_PROMPTS.theme(trendsContent);
        break;
      case 'scenario':
        prompt = AGENT_PROMPTS.scenario(theme);
        break;
      case 'kling':
        prompt = AGENT_PROMPTS.kling(scenes);
        break;
      case 'marketing':
        prompt = AGENT_PROMPTS.marketing(theme);
        break;
      case 'card_trends':
        prompt = AGENT_PROMPTS.card_trends();
        break;
      case 'card_writer':
        prompt = AGENT_PROMPTS.card_writer(topic);
        break;
      case 'card_image':
        prompt = AGENT_PROMPTS.card_image(cards);
        break;
      case 'card_marketer':
        prompt = AGENT_PROMPTS.card_marketer(topic, cards);
        break;
      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    const text = await generateContent(prompt + "\nJSON 코드만 출력하고 다른 설명은 하지 마세요.");
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
