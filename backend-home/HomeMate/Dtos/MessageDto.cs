using System;

namespace HomeMate.Dtos
{
    public class SendMessageDto
    {
        public string SenderId { get; set; } = null!; // Added for non-auth testing
        public string ReceiverId { get; set; } = null!;
        public string Content { get; set; } = null!;
    }

    public class MessageDto
    {
        public string Id { get; set; } = null!;
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }
}
