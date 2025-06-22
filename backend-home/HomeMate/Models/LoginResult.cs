namespace HomeMate.Models
{
    public class LoginResult
    {
        public string Token { get; set; } = string.Empty;
        public User User { get; set; } = new User();
    }
}