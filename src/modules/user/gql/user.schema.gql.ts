import { 
    userGQLResponse, 
    usersGQLResponse 
} from "./user.types";
import userResolver from "./user.resolver";
import { 
    userArgs, 
    usersArgs 
} from "./user.args";

class UserSchema {

    private userResolver;
    constructor() {
        this.userResolver=userResolver;
     }

    reqisterQuery() {
        return {
            getUsers: {
                type: usersGQLResponse,
                args:usersArgs,
                resolve:this.userResolver.getUsers
            },

            getUser: {
                type: userGQLResponse,
                args:userArgs ,
                resolver:this.userResolver.getUser
            },
        }
    }

    registerMutation() {
        return {

        }
    }
}

const userSchema = new UserSchema();
export default userSchema;