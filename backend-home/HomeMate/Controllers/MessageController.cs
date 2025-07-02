using HomeMate.Dtos;
using HomeMate.Models;
using HomeMate.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HomeMate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessageController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpPost("send")]
        // [Authorize] removed for public access
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            // For now, get senderId from dto for testing (replace with real auth later)
            var senderId = dto.SenderId ?? "test-sender";
            var message = await _messageService.SendMessageAsync(senderId, dto.ReceiverId, dto.Content);
            return Ok(new MessageDto
            {
                Id = message.Id.ToString(),
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead
            });
        }

        [HttpGet("conversation/{userId}")]
        // [Authorize] removed for public access
        public async Task<IActionResult> GetConversation(string userId, [FromQuery] string currentUserId)
        {
            var messages = await _messageService.GetConversationAsync(currentUserId, userId);
            var result = messages.Select(m => new MessageDto
            {
                Id = m.Id.ToString(),
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                SentAt = m.SentAt,
                IsRead = m.IsRead
            }).ToList();
            return Ok(result);
        }
    }
}