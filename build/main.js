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
var import_evdev = __toESM(require("evdev"));
class IrRemoteInput extends utils.Adapter {
  constructor(options = {}) {
    super(__spreadProps(__spreadValues({}, options), {
      name: "ir_remote_input"
    }));
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this._reader = new import_evdev.default({ raw: true });
  }
  async onReady() {
    this.log.info("Device path configured: " + this.config.devicePath);
    this._reader.on("EV_KEY", (data) => {
      this.log.info("key : " + data.code + " - " + data.value);
    });
    this._reader.on("EV_ABS", (data) => {
      this.log.info("Absolute axis : " + data.code + " - " + data.value);
    });
    this._reader.on("EV_REL", (data) => {
      this.log.info("Relative axis : " + data.code + " - " + data.value);
    });
    this._reader.on("error", (err) => {
      this.log.info("reader error : " + err);
    });
    this._reader.search("/dev/input/by-path", this.config.devicePath, (err, devicePaths) => {
      if (err) {
        this.log.warn("No input device found for gicen config, run ls /dev/input/by-path/ to identify your device");
        return;
      }
      this.log.info("Devices found: " + JSON.stringify(devicePaths));
      if (devicePaths.length > 1) {
        this.log.warn("More than one possible input device found, please configure a more precise path");
      }
      const device = this._reader.open(devicePaths[0]);
      device.on("open", () => {
        this.log.info("Device successfully opened");
      });
    });
    await this.setObjectNotExistsAsync("testVariable", {
      type: "state",
      common: {
        name: "testVariable",
        type: "boolean",
        role: "indicator",
        read: true,
        write: true
      },
      native: {}
    });
    this.subscribeStates("testVariable");
    await this.setStateAsync("testVariable", true);
    await this.setStateAsync("testVariable", { val: true, ack: true });
    await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
    let result = await this.checkPasswordAsync("admin", "iobroker");
    this.log.info("check user admin pw iobroker: " + result);
    result = await this.checkGroupAsync("admin", "admin");
    this.log.info("check group user admin group admin: " + result);
  }
  onUnload(callback) {
    try {
      this.log.info("unloading...");
      this._reader.close();
    } catch (e) {
      this.log.warn("error while unloading: " + e);
    } finally {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new IrRemoteInput(options);
} else {
  (() => new IrRemoteInput())();
}
//# sourceMappingURL=main.js.map
