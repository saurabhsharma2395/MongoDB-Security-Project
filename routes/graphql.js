const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat, GraphQLInt, GraphQLNonNull, GraphQLID } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/http');
const Restaurant = require('../models/restaurant.js'); // Adjust the path to your model

// Define the GraphQL Grade Type
const GradeType = new GraphQLObjectType({
    name: 'Grade',
    fields: () => ({
        date: { type: GraphQLString },
        grade: { type: GraphQLString },
        score: { type: GraphQLInt }
    })
});

// Define the GraphQL Address Type
const AddressType = new GraphQLObjectType({
    name: 'Address',
    fields: () => ({
        building: { type: GraphQLString },
        coord: { type: new GraphQLList(GraphQLFloat) },
        street: { type: GraphQLString },
        zipcode: { type: GraphQLString },
        borough: { type: GraphQLString }
    })
});

// Define the GraphQL Restaurant Type
const RestaurantType = new GraphQLObjectType({
    name: 'Restaurant',
    fields: () => ({
        _id: { type: GraphQLID },
        address: { type: AddressType },
        cuisine: { type: GraphQLString },
        grades: { type: new GraphQLList(GradeType) },
        name: { type: GraphQLString },
        restaurant_id: { type: GraphQLString }
    })
});

// Define the Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        restaurant: {
            type: RestaurantType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                return Restaurant.findById(args._id);
            }
        }
        // Add other queries here if necessary
    }
});

// Define the Mutation
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        updateRestaurant: {
            type: RestaurantType,
            args: {
                _id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                cuisine: { type: GraphQLString },
                // Add other fields for update as necessary
            },
            resolve(parent, args) {
                return Restaurant.findByIdAndUpdate(args._id, args, { new: true });
            }
        },
        deleteRestaurant: {
            type: RestaurantType,
            args: {
                _id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Restaurant.findByIdAndRemove(args._id);
            }
        }
    }
});

// Create the GraphQL Schema
const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation
});

// Create the GraphQL over HTTP handler
const graphqlHandler = createHandler({ schema });

// Middleware for Express
const graphqlMiddleware = (req, res, next) => {
    if (req.originalUrl.startsWith('/graphql')) {
        graphqlHandler(req, res);
    } else {
        next();
    }
};

module.exports = graphqlMiddleware;
