dotnet ef dbcontext scaffold "Host=localhost;Port=5432;Database=mentor_x;Username=postgres;Password=123456" Npgsql.EntityFrameworkCore.PostgreSQL -o Models -c MentorXContext -f --force
