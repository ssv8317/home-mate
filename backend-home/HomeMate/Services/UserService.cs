using BCrypt.Net;
using HomeMate.Data;
using HomeMate.Dtos;
using HomeMate.Models;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HomeMate.Services
{
    public class UserService
    {
        private readonly MongoDbContext _context;

        public UserService(MongoDbContext context)
        {
            _context = context;
        }

public async Task<User> RegisterUserAsync(RegisterUserDto dto)
{
    var user = new User
    {
        FullName = dto.FullName,
        Email = dto.Email,
        PasswordHash = HashPassword(dto.Password),
        Age = dto.Age,
        Gender = dto.Gender,
        Occupation = dto.Occupation,
        College = dto.College,
        SleepSchedule = dto.SleepSchedule,
        CleanlinessLevel = dto.CleanlinessLevel, // Now string
        SmokingPreference = dto.SmokingPreference,
        PetFriendly = dto.PetFriendly, // Now string
        BudgetRange = dto.BudgetRange,
        LocationPreference = dto.LocationPreference,
        AboutMe = dto.AboutMe,
        CreatedAt = DateTime.UtcNow
    };

    await _context.Users.InsertOneAsync(user);
    return user;
}

        public async Task<LoginResult> LoginUserAsync(LoginUserDto dto)
        {
            var user = await AuthenticateUserAsync(dto.Email, dto.Password);
            
            if (user == null)
            {
                return null; // Invalid credentials
            }

            var token = GenerateJwtToken(user);
            
            return new LoginResult
            {
                Token = token,
                User = user
            };
        }

        public async Task<User> AuthenticateUserAsync(string email, string password)
        {
            var user = await _context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
            if (user == null)
                return null;

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            return isPasswordValid ? user : null;
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("your-super-secret-jwt-key-that-should-be-at-least-32-characters-long!");
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.FullName)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }
}