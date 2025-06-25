export type Document = {
  id: string;
  title: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ErrorData = {
  title?: string;
  message?: string;
  code?: string;
}; 