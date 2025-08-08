using API.Middleware;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// 註冊控制器服務（讓 ASP.NET Core 支援 API 控制器功能）
builder.Services.AddControllers(opt =>
{
    // 建立一個授權策略：要求使用者必須已驗證（登入）
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    // 套用這個授權策略到所有的 API 控制器（全域授權）
    opt.Filters.Add(new AuthorizeFilter(policy));
});

// 註冊資料庫服務，這裡使用 Entity Framework Core + SQLite
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    // 設定使用 SQLite，連線字串從 appsettings.json 的 DefaultConnection 拿
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// 註冊 CORS（跨來源資源共享）服務，讓 API 可以接受來自不同網域的請求（例如前端在 localhost:3000）
builder.Services.AddCors();

// 註冊 MediatR，從 GetActivityList.Handler 所在的組件中掃描並註冊所有 Handler
// 同時加入 ValidationBehavior 作為通用的 Pipeline 行為，用於自動處理所有請求的驗證
builder.Services.AddMediatR(x =>
{
    x.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>();
    x.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

builder.Services.AddScoped<IUserAccessor, UserAccessor>();

// 註冊 AutoMapper，從 MappingProfiles 所在的 Assembly 掃描所有的 Mapping 設定檔（Profile 類別）
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);

// 註冊 FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();

// 註冊自訂的 ExceptionMiddleware 作為 Transient（每次請求都會建立新實例）
builder.Services.AddTransient<ExceptionMiddleware>();

builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
}).AddRoles<IdentityRole>()
  .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthorization(opt =>
{
    // 註冊自訂的 IsHostRequirement 授權要求
    opt.AddPolicy("IsActivityHost", policy => policy.Requirements.Add(new IsHostRequirement()));
});

builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

var app = builder.Build();

// 加入自訂的 ExceptionMiddleware 到中介軟體管線中，需放在其他中介軟體之前才能正確攔截錯誤
app.UseMiddleware<ExceptionMiddleware>();
// Configure the HTTP request pipeline.
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("http://localhost:3000", "https://localhost:3000"));

// 身份驗證（辨識用戶是誰，建立 HttpContext.User）
app.UseAuthentication();
// 權限驗證（檢查是否符合 [Authorize] 條件）
app.UseAuthorization();

app.MapControllers();
app.MapGroup("api").MapIdentityApi<User>();

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDbContext>();
    var userManager = services.GetRequiredService<UserManager<User>>();
    await context.Database.MigrateAsync();
    await DbInitializer.SeedData(context, userManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during migration");
}

app.Run();
