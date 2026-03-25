namespace TideUpTogetherServer;

[Serializable]
public struct SyncData {
    
    public string ConnectionId;
    
    public string CharacterName;
    public float  CharacterIndex;
    public float  Pattern;
    public float  AnimationCount;
    
    public float MapId;
    public float X, Y;
    public float Direction;
}