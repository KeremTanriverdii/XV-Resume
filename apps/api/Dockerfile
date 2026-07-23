# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files first for efficient caching
COPY ["ResumeXCreator.Api/ResumeXCreator.Api.csproj", "ResumeXCreator.Api/"]
COPY ["ResumeXCreator.Domain/ResumeXCreator.Domain.csproj", "ResumeXCreator.Domain/"]
COPY ["ResumeXCreator.Infrastructure/ResumeXCreator.Infrastructure.csproj", "ResumeXCreator.Infrastructure/"]
COPY ["ResumeXCreator.Services/ResumeXCreator.Services.csproj", "ResumeXCreator.Services/"]

RUN dotnet restore "ResumeXCreator.Api/ResumeXCreator.Api.csproj"

# Copy remaining source code and publish
COPY . .
WORKDIR "/src/ResumeXCreator.Api"
RUN dotnet publish "ResumeXCreator.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResumeXCreator.Api.dll"]
