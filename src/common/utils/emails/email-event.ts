import { EventEmitter } from "events";

const emailEmitter = new EventEmitter();

emailEmitter.on(
    "sendEmail",
    (task: () => Promise<unknown>) => {
        void task().catch((error) => {
            console.error("Email sending error:", error);
        });
    }
);

export default emailEmitter;