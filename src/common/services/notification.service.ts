// import admin from "firebase-admin";

import { App, cert, initializeApp } from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ISendNotification } from "../interfaces/notification.interface";
import { getMessaging } from "firebase-admin/messaging";

class NotificationService {
    private client: App;
    constructor() {
        const serviceAccount = JSON.parse(readFileSync(
            resolve(
                __dirname,
                "../config/social-media-app-route-firebase-adminsdk-fbsvc-c5ae11bf35social-media-app-route-firebase-adminsdk-fbsvc-c5ae11bf35.json"
            ),
            "utf-8"
        ));

        this.client = initializeApp({
            credential: cert(serviceAccount)
        });
    }


    async sendNotification({
        token,
        title,
        data
    }: ISendNotification) {

        await getMessaging(this.client).send({
            token,
            notification: {
                title,
                body: data
            }
        })
    }
}

const notificationService=new NotificationService();
export default notificationService;

