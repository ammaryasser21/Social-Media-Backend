class UserResolver {
    constructor() {

    }

    getUser(
        parent: any,
        args: {
            name: string,
            age: number
        },
        context: any
    ) {
        return {
            name: args.name,
            age: args.age
        };
    }

    getUsers(
        parent: any,
        args: {
            users: {
                name: string;
                age: number;
                role: string
            }[];
        },
        context: any
    ) {
        return args.users;
    }

}

const userResolver = new UserResolver();
export default userResolver;