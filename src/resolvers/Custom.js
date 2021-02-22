const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

module.exports = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      console.log(value);
      return new Date(value);
    },
    serialize(value) {
      return value.toISOString().split("T")[0];
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(+ast.value);
      }
      return null;
    },
  }),

  Anything: new GraphQLScalarType({
    name: "Anything",
    description: "Any value.",
    parseValue: (value) => value,
    parseLiteral,
    serialize: (value) => value,
  }),
};

function parseLiteral(ast) {
  switch (ast.kind) {
    case Kind.BOOLEAN:
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value);
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    case Kind.OBJECT:
      return ast.fields.reduce((accumulator, field) => {
        accumulator[field.name.value] = parseLiteral(field.value);
        return accumulator;
      }, {});
    case Kind.NULL:
      return null;
    default:
      throw new Error(`Unexpected kind in parseLiteral: ${ast.kind}`);
  }
}
