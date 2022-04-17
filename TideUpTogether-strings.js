const TUT_EXPRESSION = {
    
    NOTHING:        1,
    BOING:          2,
    DULDUL:         3,
    DOWN:           4,
    DOWN_FORWARD:   5,
    ITAI:           6,
    THIEF:          7,
    MEAT:           8,
    MEMORY:         9,
    SIT_GROUND:     10,
    SHIRT:          11,
    DANCE:          12,
    INTENSE_DANCE:  13,
    STONE:          14,
    BEAR:           15,
    SISTER:         16,
    GHOST:          17,
    DOG_A:          18,
    DOG_B:          19,
    NIGHTMARE:      20,
    GUARD:          21,
    BUCKET_HEAD:    22,
    PRISONER:       23,
    SOFT_MANNEQUIN: 24,
    MANNEQUIN:      25,
    SPIDER:         26,
    TONGUE_EYES:    27,
    SNAKE:          28,
    EARS:           29,
    GUTS_MAN:       30,
    GIANT:          31,
    PIG_MAN:        32,
    I_LIKE_MONEY:   33,
    SPIKE:          34
}

var TUTStrings = {
    
    Online: "온라인",
    Offline: "오프라인",
    
    Menu_Expression: "감정표현",
    Menu_Message: "메시지 남기기",
    
    Menu_MessageTitle: "현재 위치에 남길 메시지를 작성해주세요.",
    Menu_MessageNote: "작성 한 메시지는 접속한 서버에 기록되며, 다른 플레이어들에게 무작위로 노출됩니다.",
    
    Menu_MessageTypes: [
        "타입 A",
        "타입 B"
    ],
    Menu_MessageHeaders: [
        "문장 타입",
        "문장 1",
        "단어 1",
        "부사",
        "문장 2",
        "단어 2"
    ],
    Menu_MessageSelectWordBase: "사용 할 문장을 선택하세요.",
    Menu_MessageSelectWord: "사용 할 단어를 선택하세요.",
    Menu_MessageSelectAdverb: "사용 할 부사를 선택하세요.",
    
    Menu_MessageConfirm: "작성 완료",
    
    Menu_MessageFailed: "서버에 메시지를 남기지 못했습니다, 잠시 뒤에 다시 시도해보세요.",
    Menu_MessageFailedOk: "돌아가기",
    Menu_MessagePosting: "서버에 메시지를 남기는 중...",
    Menu_MessageSent: "\\TA[1]서버에 아래의 메시지를 해당 위치에 남겼습니다.",
    
    Expressions: {
        
        [TUT_EXPRESSION.BOING]:          "제자리 뛰기",
        [TUT_EXPRESSION.DULDUL]:         "타케시",
        [TUT_EXPRESSION.DOWN]:           "드러눕기",
        [TUT_EXPRESSION.DOWN_FORWARD]:   "엎드려",
        [TUT_EXPRESSION.ITAI]:           "아야!",
        [TUT_EXPRESSION.THIEF]:          "합!",
        [TUT_EXPRESSION.MEAT]:           "고기...",
        [TUT_EXPRESSION.MEMORY]:         "기억...",
        [TUT_EXPRESSION.SIT_GROUND]:     "바닥에 앉기",
        [TUT_EXPRESSION.STONE]:          "단단해지기",
        [TUT_EXPRESSION.SPIDER]:         "그거!",
        [TUT_EXPRESSION.GHOST]:         "???",
        [TUT_EXPRESSION.GUARD]:          "간수 가드",
        [TUT_EXPRESSION.BEAR]:           "곰",
        [TUT_EXPRESSION.SPIKE]:          "가시인 척",
        [TUT_EXPRESSION.DANCE]:          "댄스",
        [TUT_EXPRESSION.INTENSE_DANCE]:  "흥겨운 댄스",
        [TUT_EXPRESSION.PRISONER]:       "죄수",
        [TUT_EXPRESSION.DOG_A]:          "개...?",
        [TUT_EXPRESSION.DOG_B]:          "드러누운 개...?",
        [TUT_EXPRESSION.SNAKE]:          "뱀",
        [TUT_EXPRESSION.BUCKET_HEAD]:    "버킷 헤드",
        [TUT_EXPRESSION.EARS]:           "귀벌레",
        [TUT_EXPRESSION.TONGUE_EYES]:    "배고픈 괴물",
        [TUT_EXPRESSION.MANNEQUIN]:      "뒤틀린 마네킹",
        [TUT_EXPRESSION.GUTS_MAN]:       "내장 괴물",
        [TUT_EXPRESSION.SOFT_MANNEQUIN]: "마네킹",
        [TUT_EXPRESSION.GIANT]:          "거인",
        [TUT_EXPRESSION.PIG_MAN]:        "돼지",
        [TUT_EXPRESSION.I_LIKE_MONEY]:   "난 돈이 좋아...",
        [TUT_EXPRESSION.NIGHTMARE]:      "악몽",
        [TUT_EXPRESSION.SISTER]:         "언니",
        [TUT_EXPRESSION.SHIRT]:          "티셔츠",
    }
};

const TUT_RAW_MSG_CSV_TABLE = `
베이스,앞에 ~ 있어...,앞에 ~ 없어...,앞에 ~ 조심해...,~ 써야 해,~ 있었으면...,으... ~...,~ 한 느낌...,먼저 ~,~일 줄이야...,~ 봐,~...,~가 있어야 해,하지만 ~...,그래도 ~,"아아, ~",~ 하면 안돼,아마도 ~...,~,~!,~?,오오 ~ 오오,,,,,,,,,,,,,,,,,,,,,,,
장소,숲,집,절벽,공장,감옥,숨겨진 공간,숨겨진 벽,정거장,병원,산,난파선,북극,빛 바랜 세상,터널,학교,호수,마을,하수도,,,,,,,,,,,,,,,,,,,,,,,,,,
행동,걷기,달리기,열기,닫기,돌아보기,공격,잠시 휴식,양손 잡기,기습,돌아가는 길,샛길,지름길,스태미나,체력,삶,죽음,빛,어둠,별,아님,화남,괴로움,기쁨,혼돈,규칙,슬픔,치유,행복,불행,행운,불운,희망,절망,탐구,기회,위기,우정,애정,근성,용기,포기,헛됨,배신,한계
대상,적,언니,너,가시,비밀,형제,부모님,마네킹,친구,거미,그림자,머리,입,나,보스,괴물,고양이,개,좋은 녀석,나쁜 녀석,귀여운 녀석,이상한 녀석,아이템,승강기,아빠,엄마,아버지,어머니,거짓말쟁이,,,,,,,,,,,,,,,
방향,위,아래,왼쪽,오른쪽,멀리,가까이,근처에,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
물건,생수,아이템,보물,알,동전,열쇠,락픽,고기,망치,랜턴,참치캔,빵,기억의 조각,티켓,문고리,사진,필요한 아이템,귀중한 아이템,무언가,대단한 무언가,상자,가방,빈 병,파우치,스티커,삽,안경,칼,반지,,,,,,,,,,,,,,,
속삭임,열심히 해,잘 봐,잘 들어,잘 생각해,잘 했어,해냈어!!,저질렀다...,여기야!,여기가 아니야!,그만둬!,해버려!,마음이 꺾일 것 같다,생각하지 마,쓸쓸해...,또 여기냐...,이제부터가 진짜다,허둥대지 마라,멈추지 마,돌아가라,포기해라,포기하지 마,살려줘...,말도 안돼...,돌아가고 싶어...,꿈같아...,그립다...,아름다워,그럴 자격 없어,각오는 됐어?,,,,,,,,,,,,,,,
접두사, ,", ", 그리고 , 하지만 , 그래도 , 그래서 , 그치만 ,... ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
`;