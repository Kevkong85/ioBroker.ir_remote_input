var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_reader = require("./reader.manager");
var import_stateStore = require("./stateStore.service");
class IrRemoteInput extends utils.Adapter {
  constructor(options = {}) {
    super(__spreadProps(__spreadValues({}, options), {
      name: "ir_remote_input"
    }));
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this._stateStore = new import_stateStore.StateStoreService(this);
    this._readerManager = new import_reader.ReaderManger(this, this._stateStore);
  }
  async onReady() {
    await this._stateStore.init();
    this._readerManager.init(this.config.devicePath);
  }
  onUnload(callback) {
    try {
      this.log.info("unloading...");
      this._readerManager.destroy();
    } catch (e) {
      this.log.warn("error while unloading: " + e);
    } finally {
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new IrRemoteInput(options);
} else {
  (() => new IrRemoteInput())();
}
//# sourceMappingURL=main.js.map
