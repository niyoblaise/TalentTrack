using Microsoft.AspNetCore.Identity;
using TalentTrack2.Models;

namespace TalentTrack2.Data
{
    public class DbSeeder
    {
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

            // Seed Roles
            string[] roleNames = { "Admin", "Employer", "Employee" };
            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // Assign Permissions (Claims) to Roles
            var adminRole = await roleManager.FindByNameAsync("Admin");
            var employerRole = await roleManager.FindByNameAsync("Employer");
            var employeeRole = await roleManager.FindByNameAsync("Employee");

            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Jobs.Approve);
            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Jobs.View);
            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Dashboard.ViewAdmin);
            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Categories.Manage);
            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Users.View);
            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Users.Manage);
            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Notifications.Broadcast);
            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Notifications.Access);
            await AddClaimToRole(roleManager, adminRole, Authorization.Permissions.Audit.View);

            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Jobs.Create);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Jobs.Edit);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Jobs.Delete);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Jobs.View);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Dashboard.ViewEmployer);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Applications.ViewJobApplications);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Applications.ViewDetail);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Applications.ManageStatus);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Interviews.Schedule);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Interviews.View);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Interviews.Edit);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Interviews.Cancel);
            await AddClaimToRole(roleManager, employerRole, Authorization.Permissions.Notifications.Access);

            await AddClaimToRole(roleManager, employeeRole, Authorization.Permissions.Jobs.View);
            await AddClaimToRole(roleManager, employeeRole, Authorization.Permissions.Dashboard.ViewEmployee);
            await AddClaimToRole(roleManager, employeeRole, Authorization.Permissions.Applications.Create);
            await AddClaimToRole(roleManager, employeeRole, Authorization.Permissions.Applications.ViewMy);
            await AddClaimToRole(roleManager, employeeRole, Authorization.Permissions.Applications.Withdraw);
            await AddClaimToRole(roleManager, employeeRole, Authorization.Permissions.Applications.ViewHistory);
            await AddClaimToRole(roleManager, employeeRole, Authorization.Permissions.Interviews.View);
            await AddClaimToRole(roleManager, employeeRole, Authorization.Permissions.Notifications.Access);

            // Seed Admin User
            var adminEmail = "admin@talenttrack.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var admin = new AppUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "System",
                    LastName = "Administrator",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(admin, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }

            // Seed Categories
            if (!context.Categories.Any())
            {
                var categories = new[]
                {
                    new Category { Name = "Technology", Description = "IT and Software Development" },
                    new Category { Name = "Healthcare", Description = "Medical and Healthcare Services" },
                    new Category { Name = "Finance", Description = "Banking and Financial Services" },
                    new Category { Name = "Education", Description = "Teaching and Training" },
                    new Category { Name = "Marketing", Description = "Marketing and Advertising" },
                    new Category { Name = "Sales", Description = "Sales and Business Development" },
                    new Category { Name = "Engineering", Description = "Engineering and Manufacturing" },
                    new Category { Name = "Other", Description = "Other Categories" }
                };

                context.Categories.AddRange(categories);
                await context.SaveChangesAsync();
            }
        }

        private static async Task AddClaimToRole(RoleManager<IdentityRole> roleManager, IdentityRole role, string permission)
        {
            var allClaims = await roleManager.GetClaimsAsync(role);
            if (!allClaims.Any(c => c.Type == "Permission" && c.Value == permission))
            {
                await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("Permission", permission));
            }
        }
    }
}
