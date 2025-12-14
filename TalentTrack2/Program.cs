using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using TalentTrack2.Data;
using TalentTrack2.Models;
using TalentTrack2.Services;
using TalentTrack2.Hubs;
using TalentTrack2.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
    
    // Allow SignalR to use JWT from query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && 
                (path.StartsWithSegments("/hubs") || path.StartsWithSegments("/notificationHub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Custom Services

// Custom Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEncryptionService, EncryptionService>();
builder.Services.AddScoped<IVettingService, VettingService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddHostedService<InterviewReminderService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSignalR();

// Add Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin.ViewAudit", policy => policy.RequireRole("Admin"));
    
    // Job Permissions
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Jobs.View, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Jobs.View));

    options.AddPolicy(TalentTrack2.Authorization.Permissions.Jobs.Create, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Jobs.Create));
        
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Jobs.Edit, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Jobs.Edit));
        
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Jobs.Delete, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Jobs.Delete));
        
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Jobs.Approve, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Jobs.Approve));

    // Dashboard Permissions
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Dashboard.ViewAdmin, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Dashboard.ViewAdmin));
        
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Dashboard.ViewEmployer, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Dashboard.ViewEmployer));
        
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Dashboard.ViewEmployee, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Dashboard.ViewEmployee));
        
    // Category Permissions
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Categories.Manage, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Categories.Manage));

    // User Permissions
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Users.View, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Users.View));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Users.Manage, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Users.Manage));

    // Application Permissions
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Applications.Create, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Applications.Create));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Applications.ViewMy, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Applications.ViewMy));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Applications.Withdraw, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Applications.Withdraw));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Applications.ViewJobApplications, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Applications.ViewJobApplications));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Applications.ViewDetail, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Applications.ViewDetail));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Applications.ManageStatus, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Applications.ManageStatus));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Applications.ViewHistory, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Applications.ViewHistory));

    // Interview Permissions
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Interviews.Schedule, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Interviews.Schedule));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Interviews.View, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Interviews.View));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Interviews.Edit, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Interviews.Edit));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Interviews.Cancel, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Interviews.Cancel));

    // Notification Permissions
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Notifications.Access, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Notifications.Access));
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Notifications.Broadcast, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Notifications.Broadcast));

    // Audit Permissions
    options.AddPolicy(TalentTrack2.Authorization.Permissions.Audit.View, policy => 
        policy.RequireClaim("Permission", TalentTrack2.Authorization.Permissions.Audit.View));
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// Swagger with JWT Support - Ignore file upload errors
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TalentTrack API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
    
    // Ignore errors for endpoints with file uploads
    c.CustomSchemaIds(type => type.FullName); // Fix for same name schemas
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

// Register AuditLogMiddleware
app.UseMiddleware<AuditLogMiddleware>();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

// Seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await DbSeeder.SeedRolesAndAdminAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();
