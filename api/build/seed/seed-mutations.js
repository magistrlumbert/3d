"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.getSeedMutations = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _parseFloat2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-float"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));

const fetch = require('node-fetch');

const parse = require('csv-parse/lib/sync');

const {
  gql
} = require('@apollo/client');

const getSeedMutations = async () => {
  const res = await fetch('https://cdn.neo4jlabs.com/data/grandstack_businesses.csv');
  const body = await res.text();
  const records = parse(body, {
    columns: true
  });
  const mutations = generateMutations(records);
  return mutations;
};

exports.getSeedMutations = getSeedMutations;

const generateMutations = records => {
  return (0, _map.default)(records).call(records, rec => {
    var _context;

    (0, _map.default)(_context = (0, _keys.default)(rec)).call(_context, k => {
      if (k === 'latitude' || k === 'longitude' || k === 'reviewStars') {
        rec[k] = (0, _parseFloat2.default)(rec[k]);
      } else if (k === 'reviewDate') {
        const dateParts = rec[k].split('-');
        rec['year'] = (0, _parseInt2.default)(dateParts[0]);
        rec['month'] = (0, _parseInt2.default)(dateParts[1]);
        rec['day'] = (0, _parseInt2.default)(dateParts[2]);
      } else if (k === 'categories') {
        rec[k] = rec[k].split(',');
      }
    });
    return {
      mutation: gql`
        mutation mergeReviews(
          $userId: ID!
          $userName: String!
          $businessId: ID!
          $businessName: String!
          $businessCity: String!
          $businessState: String!
          $businessAddress: String!
          $latitude: Float!
          $longitude: Float!
          $reviewId: ID!
          $reviewText: String
          $reviewDate: DateTime
          $reviewStars: Float
          $categories: [String!]!
        ) {
          user: mergeUser(userId: $userId, name: $userName) {
            userId
          }
          business: mergeBusiness(
            businessId: $businessId
            name: $businessName
            address: $businessAddress
            city: $businessCity
            state: $businessState
            latitude: $latitude
            longitude: $longitude
          ) {
            businessId
          }

          businessCategories: mergeBusinessCategory(
            categories: $categories
            businessId: $businessId
          ) {
            businessId
          }

          reviews: createReviews(
            input: {
              reviewId: $reviewId
              stars: $reviewStars
              text: $reviewText
              date: $reviewDate
              business: { connect: { where: { businessId: $businessId } } }
              user: { connect: { where: { userId: $userId } } }
            }
          ) {
            reviews {
              reviewId
              date
            }
          }
        }
      `,
      variables: rec
    };
  });
};