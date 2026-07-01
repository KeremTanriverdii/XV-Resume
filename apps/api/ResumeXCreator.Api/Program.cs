using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ResumeXCreator.Api.API.Endpoints;
using ResumeXCreator.Infrastructure;
using ResumeXCreator.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Infrastructure Services (DbContext & Repositories)
builder.Services.AddDatabaseServices(builder.Configuration);

// Business Services
builder.Services.AddBusinessServices();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
    options.Authority = builder.Configuration["Authentication:ValidIssuer"];
    options.RequireHttpsMetadata = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = true,
      ValidIssuer = builder.Configuration["Authentication:ValidIssuer"],
      ValidateAudience = true,
      ValidAudience = builder.Configuration["Authentication:ValidAudience"],
      ValidateLifetime = true,
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Authentication:JwtSecret"]!))

    };
  });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
  });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
  app.UseDeveloperExceptionPage();
}
else
{
  app.UseExceptionHandler(errorApp =>
  {
    errorApp.Run(async ctx =>
    {
      ctx.Response.StatusCode = 500;
      ctx.Response.ContentType = "application/json";
      await ctx.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred." });
    });
  });
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// ── Endpoints ──
app.MapProfileEndpoints();
app.MapResumeEndpoints();

app.Run();
