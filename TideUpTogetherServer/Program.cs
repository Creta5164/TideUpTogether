using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TideUpTogetherServer;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) => {
    
    var sslDir = context.Configuration["SslDirectory"];
    var sslPwd = context.Configuration["SslPassword"];
    
    if (!string.IsNullOrEmpty(sslDir)) {
        
        var certPath = Path.Combine(sslDir, "cert.pfx");
        
        if (File.Exists(certPath)) {
            
            serverOptions.ListenAnyIP(14522, listenOptions => {
                listenOptions.UseHttps(certPath, sslPwd);
            });
        }
    }
});

builder.Services.AddSignalR(options => {
        options.EnableDetailedErrors = true;
    })
    .AddJsonProtocol(
        options => {
            
            options.PayloadSerializerOptions.ReferenceHandler            = ReferenceHandler.IgnoreCycles;
            options.PayloadSerializerOptions.PropertyNameCaseInsensitive = true;
            options.PayloadSerializerOptions.IncludeFields               = true;
        }
    );

builder.Services.AddDbContext<CommentDbContext>();

int messageCount = 10;
int.TryParse(builder.Configuration["MessageCount"], out messageCount);
messageCount = Math.Clamp(messageCount, 0, 20);

var app = builder.Build();

using(var scope = app.Services.CreateScope()) {
    
    var dbContext = scope.ServiceProvider.GetRequiredService<CommentDbContext>();
    
    dbContext.Database.EnsureCreated();
    
#if DEBUG
    if (dbContext.CommentTable.Count() == 0) {
        
        for (int i = 0; i < 100000; i++)
            dbContext.CommentTable.Add(CommentData.Debug_CreateTempData());
    }
#endif
    
    dbContext.SaveChanges();
}

MapNames.Initialize();
MessageTable.Initialize();

app.MapHub<NetworkHub>(string.Empty);

app.MapPost("/comment", async (CommentData comment, CommentDbContext db, ILogger<Program> logger) => {
    
    if (!comment.ValidateData())
        return Results.BadRequest();
    
    db.CommentTable.Add(comment);
    await db.SaveChangesAsync();
    
    logger.LogInformation(
        "[Comment] Map {MapName} at ({X}, {Y}): {Message}",
        MapNames.Get(comment.MapId),
        comment.X,
        comment.Y,
        comment.ToMessageString()
    );
    
    return Results.Ok();
});

app.MapGet("/comment", async ([FromQuery]int mapId, CommentDbContext db) => {
    
    return await db.CommentTable
        .Where(c => c.MapId == mapId)
        .OrderBy(r => EF.Functions.Random())
        .Take(messageCount)
        .ToArrayAsync();
});

app.Run();