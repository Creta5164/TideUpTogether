using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using TideUpTogetherServer;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR()
    .AddNewtonsoftJsonProtocol(
        options => {
            
            options.PayloadSerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        }
    );

builder.Services.AddMvc();
builder.Services.AddEntityFrameworkSqlite().AddDbContext<CommentDbContext>();

int messageCount = 5;
int.TryParse(builder.Configuration["MessageCount"], out messageCount);
messageCount = Math.Clamp(messageCount, 0, 10);

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

app.UseRouting();

app.UseEndpoints(endpoints => {
    
    endpoints.MapHub<NetworkHub>(string.Empty);
    
    endpoints.MapPost("/comment", async (CommentData comment, CommentDbContext db) => {
        
        if (!comment.ValidateData())
            return Results.BadRequest();
        
        db.CommentTable.Add(comment);
        await db.SaveChangesAsync();
        
        return Results.Ok();
    });
    
    endpoints.MapGet("/comment", async ([FromQuery]int mapId, CommentDbContext db) => {
        
        var random = new Random();
        
        return await db.CommentTable
            .Where(c => c.MapId == mapId)
            .OrderBy(r => EF.Functions.Random())
            .Take(messageCount)
            .ToArrayAsync();
    });
});

app.Run();