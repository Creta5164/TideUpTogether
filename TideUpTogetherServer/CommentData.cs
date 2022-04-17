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
        Wisper
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
        
        static readonly int WordTypeCount = Enum.GetNames(typeof(WordType)).Length;
        
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
        public int AdverbId { get; set; }

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
                    
                    if (AdverbId < 0 || AdverbId >= ADVERB_COUNT)
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
            result.FirstWordType = (WordType)r.Next(WordTypeCount);
            
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
                
                result.AdverbId = r.Next(ADVERB_COUNT);
                
                result.SecondBaseParagraph = r.Next(BASE_COUNT);
                result.SecondWordType = (WordType)r.Next(WordTypeCount);
                
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