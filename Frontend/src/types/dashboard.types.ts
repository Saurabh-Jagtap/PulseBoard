
export interface Poll {
  id: string;
  title: string;
  isActive: boolean;
  isPublished: boolean;
  isAnonymous: boolean;
  expiresAt: string;
  createdAt: string;
}