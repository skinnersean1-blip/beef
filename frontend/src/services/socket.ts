import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('authenticate', token);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinDebate(debateId: string) {
    this.socket?.emit('join_debate', debateId);
  }

  leaveDebate(debateId: string) {
    this.socket?.emit('leave_debate', debateId);
  }

  onCommentAdded(callback: (comment: any) => void) {
    this.socket?.on('comment_added', callback);
  }

  onVoteAdded(callback: (vote: any) => void) {
    this.socket?.on('vote_added', callback);
  }

  onBetPlaced(callback: (bet: any) => void) {
    this.socket?.on('bet_placed', callback);
  }

  emitNewComment(debateId: string, comment: any) {
    this.socket?.emit('new_comment', { debateId, comment });
  }

  emitNewVote(debateId: string, vote: any) {
    this.socket?.emit('new_vote', { debateId, vote });
  }

  emitNewBet(debateId: string, bet: any) {
    this.socket?.emit('new_bet', { debateId, bet });
  }

  onUserTyping(callback: (data: { username: string }) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserStoppedTyping(callback: (data: { username: string }) => void) {
    this.socket?.on('user_stopped_typing', callback);
  }

  emitTyping(debateId: string, username: string) {
    this.socket?.emit('typing', { debateId, username });
  }

  emitStopTyping(debateId: string, username: string) {
    this.socket?.emit('stop_typing', { debateId, username });
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export default new SocketService();
