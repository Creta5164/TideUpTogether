using System.Numerics;
using Microsoft.AspNetCore.SignalR;

namespace TideUpTogetherServer {
    
    public class NetworkHub : Hub {
        
        const string PACKET_INITIAL_SYNC = "init";
        const string PACKET_SYNC         = "sync";
        const string PACKET_TRANSFER     = "transfer";
        const string BROADCAST_INIT  = "init";
        const string BROADCAST_LEAVE = "leave";
        const string BROADCAST_JOIN  = "join";
        
        public override async Task OnConnectedAsync() {
            
            Console.WriteLine($"Connection comming form {Context.ConnectionId}");
            await Clients.Client(Context.ConnectionId).SendAsync(BROADCAST_INIT, Context.ConnectionId);
            await base.OnConnectedAsync();
        }
        
        public override async Task OnDisconnectedAsync(Exception exception) {
            
            Console.WriteLine($"Disconnected {Context.ConnectionId}");
            await Clients.All.SendAsync(BROADCAST_LEAVE, Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
        
        [HubMethodName(PACKET_INITIAL_SYNC)]
        public async Task Init(SyncData data) {
            
            data.ConnectionId = Context.ConnectionId;
            await Clients.Group(data.MapId.ToString()).SendAsync(BROADCAST_JOIN, data);
            await Groups.AddToGroupAsync(Context.ConnectionId, data.MapId.ToString());
        }
        
        [HubMethodName(PACKET_SYNC)]
        public async Task Send(SyncData data) {
            
            if (!(Clients.Group(data.MapId.ToString()) is IClientProxy groupProxy))
                return;
            
            data.ConnectionId = Context.ConnectionId;
            await groupProxy.SendAsync(PACKET_SYNC, data);
        }
        
        [HubMethodName(PACKET_TRANSFER)]
        public async Task EnterMap(int previous, SyncData data) {
            
            data.ConnectionId = Context.ConnectionId;
            
            await Clients.Group(previous.ToString()).SendAsync(BROADCAST_LEAVE, Context.ConnectionId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, previous.ToString());
            
            await Clients.Group(data.MapId.ToString()).SendAsync(BROADCAST_JOIN, data);
            await Groups.AddToGroupAsync(Context.ConnectionId, data.MapId.ToString());
        }
    }
}