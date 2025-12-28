export interface ForumTopic {
  id: string;
  title: string;
  type: TopicType;
  dateCreated: Date;
  author: Author;
}

interface Author {
  name: string;
  avatar?: string;
  role: string;
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  timestamp: string;
  likes: {
    name: string;
  }[];
}

export interface CreateTopic {
  topic: string;
  type: TopicType;
}

export interface CreatePost {
  content: string;
}

export interface TotalPostCount {
  totalCount: number;
}

export const TOPIC_TYPES = {
  QUESTION_AND_ANSWER: "QuestionAndAnswer",
  NEWS: "News",
  DISCUSSIOIN: "Discussion",
  SUGGESTION: "Suggestion",
} as const; // 'as const' makes the values read-only

export type TopicType = (typeof TOPIC_TYPES)[keyof typeof TOPIC_TYPES];
