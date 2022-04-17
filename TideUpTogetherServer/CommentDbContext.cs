using System.Reflection;
using Microsoft.EntityFrameworkCore;

namespace TideUpTogetherServer {
    
    public class CommentDbContext : DbContext {
        
        public DbSet<CommentData> CommentTable { get; set; }
        
        protected override void OnConfiguring(DbContextOptionsBuilder builder) {
            
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
#if DEBUG
                .AddJsonFile("appsettings.Development.json")
#else
                .AddJsonFile("appsettings.json")
#endif
                .Build();
            
            builder.UseSqlite($"Data Source={configuration["SQLitePath"]};", options => {
                
                options.MigrationsAssembly(Assembly.GetExecutingAssembly().FullName);
            });
            
            base.OnConfiguring(builder);
        }
    }
}