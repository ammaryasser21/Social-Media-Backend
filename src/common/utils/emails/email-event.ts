import { EventEmitter } from "events";

const emailEmitter=new EventEmitter();
emailEmitter.on("sendEmail",(fn)=>{
    try {
        fn();
    } catch (error) {
        throw(error);
    }
})

export default emailEmitter;