using System.Numerics;

namespace TideUpTogetherServer {
    
    [Serializable]
    public struct SyncData {
        
        public string ConnectionId;
        
        public string CharacterName;
        public int CharacterIndex;
        public int Pattern;
        public int AnimationCount;
        
        public int MapId;
        public float X, Y;
        public int Direction;
    }
}