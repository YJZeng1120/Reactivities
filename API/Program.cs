using Application.Activities.Queries;
using Application.Core;
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

// 註冊 MediatR，並從 GetActivityList.Handler 所在的 Assembly 掃描所有的 Handler，自動加入 DI 容器
builder.Services.AddMediatR(x => x.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>());

// 註冊 AutoMapper，從 MappingProfiles 所在的 Assembly 掃描所有的 Mapping 設定檔（Profile 類別）
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);

var app = builder.Build();


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
