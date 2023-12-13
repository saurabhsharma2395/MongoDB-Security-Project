const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat, GraphQLInt, GraphQLNonNull, GraphQLID, GraphQLInputObjectType } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/http');
const Restaurant = require('../models/restaurant.js'); 

const GradeType = new GraphQLObjectType({
    name: 'Grade',
    fields: () => ({
        date: { type: GraphQLString },
        grade: { type: GraphQLString },
        score: { type: GraphQLInt }
    })
});

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

const AddressInputType = new GraphQLInputObjectType({
    name: 'AddressInput',
    fields: {
        building: { type: GraphQLString },
        coord: { type: new GraphQLList(GraphQLFloat) },
        street: { type: GraphQLString },
        zipcode: { type: GraphQLString },
        borough: { type: GraphQLString }
    }
});

const GradeInputType = new GraphQLInputObjectType({
    name: 'GradeInput',
    fields: {
        date: { type: GraphQLString },
        grade: { type: GraphQLString },
        score: { type: GraphQLInt }
    }
});

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
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        updateRestaurant: {
            type: RestaurantType,
            args: {
                _id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                cuisine: { type: GraphQLString },
                address: { type: AddressInputType },
                grades: { type: new GraphQLList(GradeInputType) },
                restaurant_id: { type: GraphQLString }
                // Add other fields if necessary
            },
            async resolve(parent, args) {
                try {
                    console.log('Update request received:', args);
                    const restaurant = await Restaurant.findById(args._id);
                    if (!restaurant) {
                        throw new Error('Restaurant not found');
                    }

                    Object.keys(args).forEach(key => {
                        if (args[key] !== undefined && key !== '_id') {
                            restaurant[key] = args[key];
                        }
                    });

                    return restaurant.save();
                } catch (error) {
                    console.error('Error in updateRestaurant:', error);
                    throw new Error(error.message);
                }
            }
        },
        deleteRestaurant: {
            type: RestaurantType,
            args: {
                _id: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                try {
                    const deletedRestaurant = await Restaurant.findByIdAndRemove(args._id);
                    if (!deletedRestaurant) {
                        throw new Error('Restaurant not found');
                    }
                    return deletedRestaurant;
                } catch (error) {
                    throw new Error(error.message);
                }
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
