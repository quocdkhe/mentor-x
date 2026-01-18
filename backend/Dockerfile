# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["backend.csproj", "./"]

# Restore dependencies
RUN dotnet restore "backend.csproj"

# Copy remaining source code
COPY . .

# Build the project
RUN dotnet build "backend.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "backend.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy published files from publish stage
COPY --from=publish /app/publish .

# Expose port
EXPOSE 10000
ENV ASPNETCORE_URLS="http://+:10000"

# Set environment to Production
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "backend.dll"]
