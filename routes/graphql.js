const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat, GraphQLInt, GraphQLNonNull, GraphQLID } = require('graphql');
const graphqlHTTP = require('graphql-http');
const Restaurant = require('../models/restaurant.js');

const GradeType = new GraphQLObjectType({
    name: 'Grade',
    fields: () => ({
        date: { type: GraphQLString },
        grade: { type: GraphQLString },
        score: { type: GraphQLInt }
    })
});

const RestaurantType = new GraphQLObjectType({
    name: 'Restaurant',
    fields: () => ({
        _id: { type: GraphQLID },
        address: { 
            type: new GraphQLObjectType({
                name: 'Address',
                fields: () => ({
                    building: { type: GraphQLString },
                    coord: { type: new GraphQLList(GraphQLFloat) },
                    street: { type: GraphQLString },
                    zipcode: { type: GraphQLString },
                    borough: { type: GraphQLString }
                })
            })
        },
        cuisine: { type: GraphQLString },
        grades: { type: new GraphQLList(GradeType) },
        name: { type: GraphQLString },
        restaurant_id: { type: GraphQLString }
    })
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
        //TODO
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        updateRestaurant: {
            type: RestaurantType,
            args: {
                _id: { type: new GraphQLNonNull(GraphQLID) },
                // Add other fields you want to be able to update
                name: { type: GraphQLString },
                cuisine: { type: GraphQLString },
                // Add other fields as needed
            },
            resolve(parent, args) {
                // Implement logic to update a restaurant
                return Restaurant.findByIdAndUpdate(args._id, args, { new: true });
            }
        },
        deleteRestaurant: {
            type: RestaurantType,
            args: {
                _id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                // Implement logic to delete a restaurant
                return Restaurant.findByIdAndRemove(args._id);
            }
        }
    }
});

const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation
});

module.exports = graphqlHTTP({
    schema: schema,
    graphiql: true, // Set to false in production
});
