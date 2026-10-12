import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from "graphql";
import { AvailableEnum } from "../../../common/enums/available";
import { UserHydrated } from "../../../db/models/user.model";
import { TokenPayload } from "../../../common/interfaces/token.interface";

export const availableGQLEnum = new GraphQLEnumType({
    name: "AvailableEnum",
    values: {
        PRIVATE: { value: AvailableEnum.PRIVATE },
        PUBLIC: { value: AvailableEnum.PUBLIC },
        FRIENDS: { value: AvailableEnum.FRIENDS },
        ME: { value: AvailableEnum.ME },
    },
});

export const postGQLResponse = new GraphQLObjectType({
    name: "Post",
    fields: {
        _id: {
            type: new GraphQLNonNull(GraphQLID),
        },
        content: {
            type: GraphQLString,
        },
        tags: {
            type: new GraphQLList(GraphQLID),
        },
        likes: {
            type: new GraphQLList(GraphQLID),
        },
        attachments: {
            type: new GraphQLList(GraphQLString),
        },
        available: {
            type: new GraphQLNonNull(availableGQLEnum),
        },
        createdBy: {
            type: new GraphQLNonNull(GraphQLID),
        },
        deletedAt: {
            type: GraphQLString,
        },
        restoredAt: {
            type: GraphQLString,
        },
        createdAt: {
            type: GraphQLString,
        },
        updatedAt: {
            type: GraphQLString,
        },
        version: {
            type: GraphQLInt,
        },
    },
});

export const postsGQLResponse = new GraphQLList(postGQLResponse);

export type IGetPostsArgs = {

    limit: number,
    page: number,
    search: string

}

export type IGetPostsContext = {
    user: UserHydrated,
    payload: TokenPayload
}