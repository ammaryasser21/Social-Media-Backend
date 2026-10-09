import { GraphQLEnumType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { userGQLResponse } from "./user.types";
import userResolver from "./user.resolver";
import { userArgs } from "./user.args";

class UserSchema {

    private userResolver;
    constructor() {
        this.userResolver=userResolver;
     }

    reqisterQuery() {
        return {
            getUser: {
                type: new GraphQLList(
                    new GraphQLObjectType({
                        name: "UserInfo",
                        fields: {
                            name: { type: new GraphQLNonNull(GraphQLString) },
                            age: { type: GraphQLInt },
                            role: {
                                type: new GraphQLEnumType({
                                    name: "userRole",
                                    values: {
                                        ADMIN: {
                                            value: "admin"
                                        },
                                        USER: {
                                            value: "user"
                                        },
                                    }

                                }),
                            }
                        }
                    }),
                ),
                resolve() {
                    return [
                        {
                            name: "ammar",
                            age: 23,
                            role: "user"
                        },
                        {
                            name: "ammar",
                            age: 23,
                            role: "admin"
                        },
                    ]
                }
            },

            sayHi: {
                type: userGQLResponse,
                args:userArgs ,
                resolver:this.userResolver.sayHi
            },
        }
    }

    registerMutation() {
        return {
            hello: {
                type: GraphQLString,
                resolve:this.userResolver.hello
            },
        }
    }
}

const userSchema = new UserSchema();
export default userSchema;