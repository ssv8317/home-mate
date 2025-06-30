import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'https://localhost:56636/api/Message';

  constructor(private http: HttpClient) {}

  // Fetch all messages between two users
  getConversation(userId: string, currentUserId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversation/${userId}?currentUserId=${currentUserId}`);
  }

  // Send a message
  sendMessage(senderId: string, receiverId: string, content: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/send`, {
      senderId,
      receiverId,
      content
    });
  }
}