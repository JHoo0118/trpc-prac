import { Notification } from "@advanced-react/server/database/schema";

type NotificationWithContent = Notification & {
  content: string;
};
export type NotificationForList = NotificationWithContent;
