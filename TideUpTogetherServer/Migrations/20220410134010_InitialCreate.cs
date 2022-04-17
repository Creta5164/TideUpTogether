using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TideUpTogetherServer.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "comments",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    map = table.Column<int>(type: "INTEGER", nullable: false),
                    x = table.Column<float>(type: "REAL", nullable: false),
                    y = table.Column<float>(type: "REAL", nullable: false),
                    type = table.Column<int>(type: "INTEGER", nullable: false),
                    fpara = table.Column<int>(type: "INTEGER", nullable: false),
                    fword_type = table.Column<int>(type: "INTEGER", nullable: false),
                    fword = table.Column<int>(type: "INTEGER", nullable: false),
                    adverb = table.Column<int>(type: "INTEGER", nullable: false),
                    spara = table.Column<int>(type: "INTEGER", nullable: false),
                    sword_type = table.Column<int>(type: "INTEGER", nullable: false),
                    sword = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_comments", x => x.id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "comments");
        }
    }
}
