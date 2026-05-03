/**
 * features/posts/types.ts
 * 前端文章特性层的类型复用（从 types/ 中 re-export，避免跨层直接引用）
 */
export type {
  PostRow,
  Post,
  PostListItem,
  PostStatus,
  CreatePostInput,
  UpdatePostInput,
  PostQueryParams,
  PaginatedResult,
} from '@/types/post'
