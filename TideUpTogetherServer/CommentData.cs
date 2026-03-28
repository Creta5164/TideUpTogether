using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TideUpTogetherServer {
    
    public enum CommentType {
        
        One,
        Two
    }
    
    public enum WordType {
        
        Location,
        Action,
        Subject,
        Direction,
        Object,
        Wisper,
        
        MaxValue
    }
    
    [Serializable, Table("comments")]
    public class CommentData {
        
        const int MAP_COUNT = 261;
        
        const int BASE_COUNT = 21;
        
        const int LOCATION_COUNT  = 18;
        const int ACTION_COUNT    = 44;
        const int SUBJECT_COUNT   = 29;
        const int DIRECTION_COUNT = 7;
        const int OBJECT_COUNT    = 29;
        const int WISPER_COUNT    = 29;
        
        const int ADVERB_COUNT = 8;
        
        //TideUpTogether-strings 참고
        static readonly string[] BASE_TEMPLATES = [
            "앞에 ~ 있어...", "앞에 ~ 없어...", "앞에 ~ 조심해...", "~ 써야 해",     "~ 있었으면...",
            "으... ~...",     "~ 한 느낌...",   "먼저 ~",           "~일 줄이야...", "~ 봐",
            "~...",           "~가 있어야 해",  "하지만 ~...",      "그래도 ~",      "아아, ~",
            "~ 하면 안돼",    "아마도 ~...",    "~",                "~!",            "~?",
            "오오 ~ 오오"
        ];
        
        //TideUpTogether-strings 참고
        static readonly string[][] WORDS = [
            //장소
            [
                "숲",          "집",        "절벽",         "공장", "감옥",
                "숨겨진 공간", "숨겨진 벽", "정거장",       "병원", "산",
                "난파선",      "북극",      "빛 바랜 세상", "터널", "학교",
                "호수",        "마을",      "하수도"
            ],
            //행동
            [
                "걷기", "달리기",    "열기",      "닫기", "돌아보기",
                "공격", "잠시 휴식", "양손 잡기", "기습", "돌아가는 길",
                "샛길", "지름길",    "스태미나",  "체력", "삶",
                "죽음", "빛",        "어둠",      "별",   "아님",
                "화남", "괴로움",    "기쁨",      "혼돈", "규칙",
                "슬픔", "치유",      "행복",      "불행", "행운",
                "불운", "희망",      "절망",      "탐구", "기회",
                "위기", "우정",      "애정",      "근성", "용기",
                "포기", "헛됨",      "배신",      "한계"
            ],
            //대상
            [
                "적",           "언니",        "너",     "가시",      "비밀",
                "형제",         "부모님",      "마네킹", "친구",      "거미",
                "그림자",       "머리",        "입",     "나",        "보스",
                "괴물",         "고양이",      "개",     "좋은 녀석", "나쁜 녀석",
                "귀여운 녀석",  "이상한 녀석", "아이템", "승강기",    "아빠",
                "엄마",         "아버지",      "어머니", "거짓말쟁이"
            ],
            //방향
            [
                "위",           "아래",         "왼쪽",         "오른쪽",       "멀리",
                "가까이",       "근처에"
            ],
            //물건
            [
                "생수",         "아이템",        "보물",          "알",     "동전",
                "열쇠",         "락픽",          "고기",          "망치",   "랜턴",
                "참치캔",       "빵",            "기억의 조각",   "티켓",   "문고리",
                "사진",         "필요한 아이템", "귀중한 아이템", "무언가", "대단한 무언가",
                "상자",         "가방",          "빈 병",         "파우치", "스티커",
                "삽",           "안경",          "칼",            "반지"
            ],
            //속삭임
            [
                "열심히 해",         "잘 봐",               "잘 들어",        "잘 생각해",        "잘 했어",
                "해냈어!!",          "저질렀다...",         "여기야!",        "여기가 아니야!",   "그만둬!",
                "해버려!",           "마음이 꺾일 것 같다", "생각하지 마",    "쓸쓸해...",        "또 여기냐...",
                "이제부터가 진짜다", "허둥대지 마라",       "멈추지 마",      "돌아가라",         "포기해라",
                "포기하지 마",       "살려줘...",           "말도 안돼...",   "돌아가고 싶어...", "꿈같아...",
                "그립다...",         "아름다워",            "그럴 자격 없어", "각오는 됐어?"
            ]
        ];
        
        //TideUpTogether-strings 참고
        static readonly string[] Adverbs = [
            " ",
            ", ",
            " 그리고 ",
            " 하지만 ",
            " 그래도 ",
            " 그래서 ",
            " 그치만 ",
            "... "
        ];
        
        static string MakeParagraph(int baseIndex, WordType wordType, int wordIndex) {
            
            if (baseIndex < 0 || baseIndex >= BASE_TEMPLATES.Length)
                return "???";
            
            var wordTypeIndex = (int)wordType;
            
            if (wordTypeIndex < 0 || wordTypeIndex >= WORDS.Length
             || wordIndex     < 0 || wordIndex     >= WORDS[wordTypeIndex].Length)
                return BASE_TEMPLATES[baseIndex];
            
            return BASE_TEMPLATES[baseIndex].Replace("~", WORDS[wordTypeIndex][wordIndex]);
        }
        
        internal string ToMessageString() {
            
            string first = MakeParagraph(FirstBaseParagraph, FirstWordType, FirstWordId);
            
            if (Type != CommentType.Two)
                return first;
            
            string adverb = AdverbID >= 0 && AdverbID < Adverbs.Length
                ? Adverbs[AdverbID]
                : string.Empty;
            
            string second = MakeParagraph(SecondBaseParagraph, SecondWordType, SecondWordId);
            
            return first + adverb + second;
        }
        
        [Key, Column("id"), JsonPropertyName("id")]
        public int Id { get; set; }
        
        [Column("map"), JsonPropertyName("map"), Required]
        public int MapId { get; set; }
        
        [Column("x"), JsonPropertyName("x"), Required]
        public float X { get; set; }
        [Column("y"), JsonPropertyName("y"), Required]
        public float Y { get; set; }
        
        [Column("type"), JsonPropertyName("type"), Required]
        public CommentType Type { get; set; }
        
        [Column("fpara"), JsonPropertyName("fpara"), Required]
        public int FirstBaseParagraph { get; set; }
        [Column("fword_type"), JsonPropertyName("fword_type"), Required]
        public WordType FirstWordType { get; set; }
        [Column("fword"), JsonPropertyName("fword"), Required]
        public int FirstWordId { get; set; }
        
        [Column("adverb"), JsonPropertyName("adverb")]
        public int AdverbID { get; set; }
        
        [Column("spara"), JsonPropertyName("spara")]
        public int SecondBaseParagraph { get; set; }
        [Column("sword_type"), JsonPropertyName("sword_type")]
        public WordType SecondWordType { get; set; }
        [Column("sword"), JsonPropertyName("sword")]
        public int SecondWordId { get; set; }
        
        internal bool ValidateData() {
            
            if (MapId <= 0 || MapId > MAP_COUNT)
                return false;
            
            //Won't determine it's size because... :eyes:
            if (X < 0 || Y < 0)
                return false;
            
            if (FirstBaseParagraph < 0 || FirstBaseParagraph >= BASE_COUNT)
                return false;
            
            if (FirstWordId < 0)
                return false;
            
            switch (FirstWordType) {
                
                default: return false;
                
                case WordType.Location:  if (FirstWordId >= LOCATION_COUNT)  return false; break;
                case WordType.Action:    if (FirstWordId >= ACTION_COUNT)    return false; break;
                case WordType.Subject:   if (FirstWordId >= SUBJECT_COUNT)   return false; break;
                case WordType.Direction: if (FirstWordId >= DIRECTION_COUNT) return false; break;
                case WordType.Object:    if (FirstWordId >= OBJECT_COUNT)    return false; break;
                case WordType.Wisper:    if (FirstWordId >= WISPER_COUNT)    return false; break;
            }
            
            switch (Type) {
                
                default: return false;
                
                case CommentType.One: break;
                case CommentType.Two:
                    
                    if (AdverbID < 0 || AdverbID >= ADVERB_COUNT)
                        return false;
                    
                    if (SecondBaseParagraph < 0 || SecondBaseParagraph >= BASE_COUNT)
                        return false;
                    
                    if (SecondWordId < 0)
                        return false;
                    
                    switch (SecondWordType) {
                        
                        default: return false;
                        
                        case WordType.Location:  if (SecondWordId >= LOCATION_COUNT)  return false; break;
                        case WordType.Action:    if (SecondWordId >= ACTION_COUNT)    return false; break;
                        case WordType.Subject:   if (SecondWordId >= SUBJECT_COUNT)   return false; break;
                        case WordType.Direction: if (SecondWordId >= DIRECTION_COUNT) return false; break;
                        case WordType.Object:    if (SecondWordId >= OBJECT_COUNT)    return false; break;
                        case WordType.Wisper:    if (SecondWordId >= WISPER_COUNT)    return false; break;
                    }
                    
                    break;
            }
            
            return true;
        }
        
#if DEBUG
        internal static CommentData Debug_CreateTempData() {
            
            var r = new Random();
            
            var result = new CommentData();
            
            result.MapId = 1 + r.Next(MAP_COUNT);
            
            result.X = (float)(r.NextDouble() * 30);
            result.Y = (float)(r.NextDouble() * 30);
            
            result.FirstBaseParagraph = r.Next(BASE_COUNT);
            result.FirstWordType = (WordType)r.Next((int)WordType.MaxValue);
            
            switch (result.FirstWordType) {
                
                case WordType.Location:  result.FirstWordId = r.Next(LOCATION_COUNT);  break;
                case WordType.Action:    result.FirstWordId = r.Next(ACTION_COUNT);    break;
                case WordType.Subject:   result.FirstWordId = r.Next(SUBJECT_COUNT);   break;
                case WordType.Direction: result.FirstWordId = r.Next(DIRECTION_COUNT); break;
                case WordType.Object:    result.FirstWordId = r.Next(OBJECT_COUNT);    break;
                case WordType.Wisper:    result.FirstWordId = r.Next(WISPER_COUNT);    break;
            }
            
            result.Type = r.Next(10) < 7 ? CommentType.One : CommentType.Two;
            
            if (result.Type == CommentType.Two) {
                
                result.AdverbID = r.Next(ADVERB_COUNT);
                
                result.SecondBaseParagraph = r.Next(BASE_COUNT);
                result.SecondWordType = (WordType)r.Next((int)WordType.MaxValue);
                
                switch (result.SecondWordType) {
                    
                    case WordType.Location:  result.SecondWordId = r.Next(LOCATION_COUNT);  break;
                    case WordType.Action:    result.SecondWordId = r.Next(ACTION_COUNT);    break;
                    case WordType.Subject:   result.SecondWordId = r.Next(SUBJECT_COUNT);   break;
                    case WordType.Direction: result.SecondWordId = r.Next(DIRECTION_COUNT); break;
                    case WordType.Object:    result.SecondWordId = r.Next(OBJECT_COUNT);    break;
                    case WordType.Wisper:    result.SecondWordId = r.Next(WISPER_COUNT);    break;
                }
            }
            
            return result;
        }
#endif
    }
}