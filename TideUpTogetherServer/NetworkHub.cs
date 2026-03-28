using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace TideUpTogetherServer;

public class NetworkHub : Hub {
    
    const string PACKET_INITIAL_SYNC = "init";
    const string PACKET_SYNC         = "sync";
    const string PACKET_TRANSFER     = "transfer";
    const string BROADCAST_INIT      = "init";
    const string BROADCAST_LEAVE     = "leave";
    const string BROADCAST_JOIN      = "join";
    
    //TideUpTogether-strings 참조
    enum ExpressionType
    {
        Nothing = 1,
        
        
        Boing,          Duldul,         Down,           DownForward,
        Itai,           Thief,          Meat,           Memory,
        SitGround,      Shirt,          Dance,          IntenseDance,
        Stone,          Bear,           Sister,         Ghost,
        DogA,           DogB,           Nightmare,      Guard,
        BucketHead,     Prisoner,       SoftMannequin,  Mannequin,
        Spider,         TongueEyes,     Snake,          Ears,
        GutsMan,        Giant,          PigMan,         ILikeMoney,
        Spike,
        
        MaxValue
    }
    
    static string GetExpressionName(int id)
        => id > 0 && id < (int)ExpressionType.MaxValue
            ? ((ExpressionType)id).ToString()
            : $"UNKNOWN({id})";
    
    static readonly ConcurrentDictionary<string, ExpressionType> _playerExpressionStates = new();
    
    readonly ILogger<NetworkHub> _logger;
    
    public NetworkHub(ILogger<NetworkHub> logger) {
        _logger = logger;
    }
    
    public override async Task OnConnectedAsync() {
        
        _logger.LogInformation("[Connect] {ConnectionId}", Context.ConnectionId);
        
        await Clients.Client(Context.ConnectionId).SendAsync(BROADCAST_INIT, Context.ConnectionId);
        await base.OnConnectedAsync();
    }
    
    public override async Task OnDisconnectedAsync(Exception? exception) {
        
        _logger.LogInformation("[Disconnect] {ConnectionId}", Context.ConnectionId);
        
        _playerExpressionStates.TryRemove(Context.ConnectionId, out _);
        
        await Clients.All.SendAsync(BROADCAST_LEAVE, Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
    
    [HubMethodName(PACKET_INITIAL_SYNC)]
    public async Task Init(SyncData data) {
        
        data.ConnectionId = Context.ConnectionId;
        _logger.LogInformation("[Init] {ConnectionId} joined at '{MapName}'.", Context.ConnectionId, MapNames.Get((int)data.MapId));
        
        await Clients.Group(((int)data.MapId).ToString()).SendAsync(BROADCAST_JOIN, data);
        await Groups.AddToGroupAsync(Context.ConnectionId, ((int)data.MapId).ToString());
    }
    
    [HubMethodName(PACKET_SYNC)]
    public async Task Send(SyncData data) {
        
        if (!(Clients.Group(((int)data.MapId).ToString()) is IClientProxy groupProxy))
            return;
        
        data.ConnectionId = Context.ConnectionId;
        
        var expression = (ExpressionType)(int)data.Expression;
        
        if (expression != ExpressionType.Nothing) {
            
            var previousExpression = _playerExpressionStates.GetValueOrDefault(Context.ConnectionId, ExpressionType.Nothing);
            
            if (previousExpression != expression) {
                
                _logger.LogInformation(
                    "[Expression] {ConnectionId} used '{ExpressionName}' on '{MapName}'.",
                    Context.ConnectionId,
                    GetExpressionName((int)expression),
                    MapNames.Get((int)data.MapId)
                );
            }
        }
        
        _playerExpressionStates[Context.ConnectionId] = expression;
        
        await groupProxy.SendAsync(PACKET_SYNC, data);
    }
    
    [HubMethodName(PACKET_TRANSFER)]
    public async Task EnterMap(float previous, SyncData data) {
        
        data.ConnectionId = Context.ConnectionId;
        
        _logger.LogInformation(
            "[Transfer] {ConnectionId} moved from '{Previous}' to '{MapName}'.",
            Context.ConnectionId,
            MapNames.Get((int)previous),
            MapNames.Get((int)data.MapId)
        );
        
        await Clients.Group(((int)previous).ToString()).SendAsync(BROADCAST_LEAVE, Context.ConnectionId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, ((int)previous).ToString());
        
        await Clients.Group(((int)data.MapId).ToString()).SendAsync(BROADCAST_JOIN, data);
        await Groups.AddToGroupAsync(Context.ConnectionId, ((int)data.MapId).ToString());
    }
}