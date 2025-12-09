import { create } from 'zustand';
import { NoteCommentEndpoint } from 'Frontend/generated/endpoints';
import CommentDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/CommentDto';

interface CommentNotificationState {
  comments: CommentDto[];
  unreadCount: number;

  fetchRecentComments: () => Promise<void>;
  markRead: (commentId: string) => void;
  clearUnread: () => void;
}

export const useCommentNotificationStore = create<CommentNotificationState>((set, get) => ({
  comments: [],
  unreadCount: 0,

  fetchRecentComments: async () => {
    const comments = await NoteCommentEndpoint.getRecentComments();

    const unreadCount = comments.filter((c) => !c.read).length;

    set({ comments, unreadCount });
  },

  markRead: (commentId: string) => {
    const { comments } = get();

    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, read: true } : c
    );

    const unreadCount = updated.filter((c) => !c.read).length;

    set({ comments: updated, unreadCount });
  },

  clearUnread: () =>
    set((state) => ({
      comments: state.comments.map((c) => ({ ...c, read: true })),
      unreadCount: 0,
    })),
}));
