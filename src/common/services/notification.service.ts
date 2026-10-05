import { App, cert, initializeApp } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { ISendNotification } from "../interfaces/notification.interface";



class NotificationService {
    private client: App;

    constructor() {
        const {
            FIREBASE_PROJECT_ID,
            FIREBASE_CLIENT_EMAIL,
            FIREBASE_PRIVATE_KEY,
        } = process.env;
        const projectId = FIREBASE_PROJECT_ID as string;
        const clientEmail = FIREBASE_CLIENT_EMAIL as string;
        const privateKey = FIREBASE_PRIVATE_KEY as string;
        this.client = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, "\n"),
            }),
        });
    }

    async sendNotification({
        token,
        title,
        data,
    }: ISendNotification) {
        await getMessaging(this.client).send({
            token,
            notification: {
                title,
                body: data,
            },
        });
    }
}

const notificationService = new NotificationService();

export type NotificationServiceType = typeof notificationService;

export default notificationService;