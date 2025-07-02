using HomeMate.Data;
using HomeMate.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeMate.Services
{
    public class MessageService : IMessageService
    {
        private readonly IMongoCollection<Message> _messages;

        public MessageService(MongoDbContext context)
        {
            _messages = context.Messages;
        }

        public async Task<Message> SendMessageAsync(string senderId, string receiverId, string content)
        {
            // Debug log: print sender and receiver IDs to console (for backend log)
            Console.WriteLine($"[SendMessageAsync] senderId: {senderId}, receiverId: {receiverId}, content: {content}");
            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };
            await _messages.InsertOneAsync(message);
            return message;
        }

        public async Task<List<Message>> GetConversationAsync(string userId1, string userId2)
        {
            var filter = Builders<Message>.Filter.Or(
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.SenderId, userId1),
                    Builders<Message>.Filter.Eq(m => m.ReceiverId, userId2)
                ),
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.SenderId, userId2),
                    Builders<Message>.Filter.Eq(m => m.ReceiverId, userId1)
                )
            );
            // Mark all messages sent to userId1 (current user) as read
            var unreadFilter = Builders<Message>.Filter.And(
                Builders<Message>.Filter.Eq(m => m.ReceiverId, userId1),
                Builders<Message>.Filter.Eq(m => m.SenderId, userId2),
                Builders<Message>.Filter.Eq(m => m.IsRead, false)
            );
            var update = Builders<Message>.Update.Set(m => m.IsRead, true);
            await _messages.UpdateManyAsync(unreadFilter, update);
            return await _messages.Find(filter).SortBy(m => m.SentAt).ToListAsync();
        }
    }

    public interface IMessageService
    {
        Task<Message> SendMessageAsync(string senderId, string receiverId, string content);
        Task<List<Message>> GetConversationAsync(string userId1, string userId2);
    }
}