using API.Middleware;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(opt =>
{
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

// 註冊 AutoMapper，從 MappingProfiles 所在的 Assembly 掃描所有的 Mapping 設定檔（Profile 類別）
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);

// 註冊 FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();

// 註冊自訂的 ExceptionMiddleware 作為 Transient（每次請求都會建立新實例）
builder.Services.AddTransient<ExceptionMiddleware>();

var app = builder.Build();

// 加入自訂的 ExceptionMiddleware 到中介軟體管線中，需放在其他中介軟體之前才能正確攔截錯誤
app.UseMiddleware<ExceptionMiddleware>();
// Configure the HTTP request pipeline.
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:3000", "https://localhost:3000"));

app.MapControllers();

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    await DbInitializer.SeedData(context);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during migration");
}

app.Run();
