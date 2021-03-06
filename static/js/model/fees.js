'use strict';

var _helpers = require('../utils/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _format = require('../utils/format');

var _format2 = _interopRequireDefault(_format);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The Fee structure's base fee
 *
 * @type {number}
 */
var baseTransactionFee = 3;

/**
 * The Fee structure's Fee factor
 *
 * @type {number}
 */
var currentFeeFactor = 0.05;

/**
 * The multisignature transaction fee
 *
 * @type {number}
 */
var multisigTransaction = baseTransactionFee * currentFeeFactor * 1000000;

/**
 * The provision namespace transaction rental fee for root namespace
 *
 * @type {number}
 */
var rootProvisionNamespaceTransaction = 100 * 1000000;

/**
 * The provision namespace transaction rental fee for sub-namespace
 *
 * @type {number}
 */
var subProvisionNamespaceTransaction = 10 * 1000000;

/**
 * The mosaic definition transaction fee
 *
 * @type {number}
 */
var mosaicDefinitionTransaction = 10 * 1000000;

/**
 * The common transaction fee for namespaces and mosaics
 *
 * @type {number}
 */
var namespaceAndMosaicCommon = baseTransactionFee * currentFeeFactor * 1000000;

/**
 * The cosignature transaction fee
 *
 * @type {number}
 */
var signatureTransaction = baseTransactionFee * currentFeeFactor * 1000000;

/**
 * The importance transfer transaction fee
 *
 * @type {number}
 */
var importanceTransferTransaction = baseTransactionFee * currentFeeFactor * 1000000;

/**
 * The multisignature aggregate modification transaction fee
 *
 * @type {number}
 */
var multisigAggregateModificationTransaction = 10 * currentFeeFactor * 1000000;

/**
 * Calculate message fee. 0.05 XEM per commenced 32 bytes
 *
 * If the message is empty, the fee will be 0
 *
 * @param {object} message - An message object
 *
 * @return {number} - The message fee
 */
var calculateMessage = function calculateMessage(message) {

  if (!message.payload || !message.payload.length) return 0.00;

  return currentFeeFactor * (Math.floor(message.payload.length / 2 / 32) + 1);
};

/**
 * Calculate fees for mosaics included in a transfer transaction
 *
 * @param {number} multiplier - A quantity multiplier
 * @param {object} mosaics - A mosaicDefinitionMetaDataPair object
 * @param {array} attachedMosaics - An array of mosaics to send
 *
 * @return {number} - The fee amount for the mosaics in the transaction
 */
var calculateMosaics = function calculateMosaics(multiplier, mosaics, attachedMosaics) {
  var totalFee = 0;
  var fee = 0;
  var supplyRelatedAdjustment = 0;
  for (var i = 0; i < attachedMosaics.length; i++) {
    var m = attachedMosaics[i];
    var mosaicName = _format2.default.mosaicIdToName(m.mosaicId);
    if (!(mosaicName in mosaics)) {
      return ['unknown mosaic divisibility']; //
    }
    var mosaicDefinitionMetaDataPair = mosaics[mosaicName];
    var divisibilityProperties = _helpers2.default.grep(mosaicDefinitionMetaDataPair.mosaicDefinition.properties, function (w) {
      return w.name === "divisibility";
    });
    var divisibility = divisibilityProperties.length === 1 ? ~~divisibilityProperties[0].value : 0;
    var supply = mosaicDefinitionMetaDataPair.mosaicDefinition.properties[1].value; //
    var quantity = m.quantity;
    if (supply <= 10000 && divisibility === 0) {
      // Small business mosaic fee
      fee = currentFeeFactor;
    } else {
      var maxMosaicQuantity = 9000000000000000;
      var totalMosaicQuantity = supply * Math.pow(10, divisibility);
      supplyRelatedAdjustment = Math.floor(0.8 * Math.log(maxMosaicQuantity / totalMosaicQuantity));
      var numNem = calculateXemEquivalent(multiplier, quantity, supply, divisibility);
      // Using Math.ceil below because xem equivalent returned is sometimes a bit lower than it should
      // Ex: 150'000 of nem:xem gives 149999.99999999997
      fee = calculateMinimum(Math.ceil(numNem));
    }
    totalFee += currentFeeFactor * Math.max(1, fee - supplyRelatedAdjustment);
  }
  return totalFee;
};

/**
 * Calculate fees from an amount of XEM
 *
 * @param {number} numNem - An amount of XEM
 *
 * @return {number} - The minimum fee
 */
var calculateMinimum = function calculateMinimum(numNem) {
  var fee = Math.floor(Math.max(1, numNem / 10000));
  return fee > 25 ? 25 : fee;
};

/**
 * Calculate mosaic quantity equivalent in XEM
 *
 * @param {number} multiplier - A mosaic multiplier
 * @param {number} q - A mosaic quantity
 * @param {number} sup - A mosaic supply
 * @param {number} divisibility - A mosaic divisibility
 *
 * @return {number} - The XEM equivalent of a mosaic quantity
 */
var calculateXemEquivalent = function calculateXemEquivalent(multiplier, q, sup, divisibility) {
  if (sup === 0) {
    return 0;
  }
  // TODO: can this go out of JS (2^54) bounds? (possible BUG)
  return 8999999999 * q * multiplier / sup / Math.pow(10, divisibility + 6);
};

module.exports = {
  multisigTransaction: multisigTransaction,
  rootProvisionNamespaceTransaction: rootProvisionNamespaceTransaction,
  subProvisionNamespaceTransaction: subProvisionNamespaceTransaction,
  mosaicDefinitionTransaction: mosaicDefinitionTransaction,
  namespaceAndMosaicCommon: namespaceAndMosaicCommon,
  signatureTransaction: signatureTransaction,
  calculateMosaics: calculateMosaics,
  calculateMinimum: calculateMinimum,
  calculateMessage: calculateMessage,
  calculateXemEquivalent: calculateXemEquivalent,
  currentFeeFactor: currentFeeFactor,
  importanceTransferTransaction: importanceTransferTransaction,
  multisigAggregateModificationTransaction: multisigAggregateModificationTransaction
};
//# sourceMappingURL=fees.js.map