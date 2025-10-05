import { PostService } from 'Frontend/generated/endpoints';
import type { Post } from 'Frontend/features/post/types/post';

export const postApi = {
  getPosts: async (page: number, pageSize: number) => {
    try {
      // return await PostService.getPosts(page - 1, pageSize);
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  searchPosts: async (searchText: string, page: number, pageSize: number) => {
    try {
      return await PostService.searchMessages(searchText, page - 1, pageSize);
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },

  createPost: async () => {
    try {
      return await PostService.createPost();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  updatePost: async (post: Post) => {
    try {
      // return await PostService.updatePost(post);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  deletePost: async (postId: string) => {
    try {
      // return await PostService.deletePost(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
};
