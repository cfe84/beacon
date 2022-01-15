import { Share } from "./Share";

export interface INotifier {
  sendNotificationAsync(share: Share, subject: string, body: string, shortText: string): Promise<void>
}