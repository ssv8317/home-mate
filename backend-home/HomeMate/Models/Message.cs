using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace HomeMate.Models
{
    public class Message
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime SentAt { get; set; }
    }
}
