import { INotifier } from "./INotifier";
import { Share } from "./Share";

export class MailNotifier implements INotifier {
  async sendNotificationAsync(share: Share, subject: string, body: string, shortText: string): Promise<void> {
    if (share.email) {
      console.log(`Sending mail to ${share.email}: ${body}`)
    }
  }

}