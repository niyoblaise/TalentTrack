using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentTrack2.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchScoreToJobApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MatchScore",
                table: "JobApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MatchScore",
                table: "JobApplications");
        }
    }
}
