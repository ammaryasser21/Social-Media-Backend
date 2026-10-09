class UserResolver {
    constructor() {

    }


    sayHi(
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

    hello() {
        return 'world';
    }
}

const userResolver = new UserResolver();
export default userResolver;