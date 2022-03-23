var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var reader_manager_exports = {};
__export(reader_manager_exports, {
  ReaderManger: () => ReaderManger
});
module.exports = __toCommonJS(reader_manager_exports);
var import_evdev = __toESM(require("evdev"));
var import_rxjs = require("rxjs");
class ReaderManger {
  constructor(_adapterInstance, _store) {
    this._adapterInstance = _adapterInstance;
    this._store = _store;
    this._keyEvent$ = new import_rxjs.Subject();
    this._unsubscribe$ = new import_rxjs.Subject();
    this._reader = new import_evdev.default({ raw: false });
    this._keyEvent$.pipe((0, import_rxjs.takeUntil)(this._unsubscribe$)).subscribe((data) => {
      this._adapterInstance.log.info("KEY EVENT: " + JSON.stringify(data));
    });
    this._keyEvent$.pipe((0, import_rxjs.filter)((data) => data.value === 1), (0, import_rxjs.switchMap)((startEvent) => (0, import_rxjs.race)([
      this._keyEvent$.pipe((0, import_rxjs.tap)((_) => this._adapterInstance.log.info("first race member")), (0, import_rxjs.filter)((data) => data.value === 0), (0, import_rxjs.map)((_) => startEvent), (0, import_rxjs.first)()),
      this._keyEvent$.pipe((0, import_rxjs.tap)((_) => this._adapterInstance.log.info("second race member")), (0, import_rxjs.takeWhile)((data) => data.value === 2))
    ]).pipe((0, import_rxjs.finalize)(() => {
      this._adapterInstance.log.info("FINALIZE");
      this._clearKeyEvents();
    }))), (0, import_rxjs.takeUntil)(this._unsubscribe$), (0, import_rxjs.finalize)(() => this._clearKeyEvents())).subscribe((data) => {
      this._adapterInstance.log.info("SUBSCRIPTION");
      this._setKeyEvent(data);
    });
  }
  init(devicePath) {
    this._reader.on("EV_KEY", (data) => this._keyEvent$.next(data));
    this._reader.on("error", (err) => {
      this._adapterInstance.log.error("reader error : " + err);
    });
    this._reader.search("/dev/input/by-path", devicePath, (err, devicePaths) => {
      if (err) {
        this._adapterInstance.log.warn("No input device found for given config, run ls /dev/input/by-path/ to identify your device");
        return;
      }
      this._adapterInstance.log.info("Devices found: " + JSON.stringify(devicePaths));
      if (devicePaths.length > 1) {
        this._adapterInstance.log.warn("More than one possible input device found, please configure a more precise path");
      }
      const device = this._reader.open(devicePaths[0]);
      device.on("open", () => {
        this._adapterInstance.log.info("Device successfully opened");
      });
    });
  }
  destroy() {
    this._reader.close();
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
  _clearKeyEvents() {
    this._adapterInstance.log.info("_clearKeyEvents called");
    this._store.setKeyPress("");
    this._store.setKeyLongPress("");
  }
  _setKeyEvent(data) {
    this._adapterInstance.log.info("setting key event: " + JSON.stringify(data));
    if (data.value === 1) {
      this._store.setKeyPress(data.code);
    }
    if (data.value === 2) {
      this._store.setKeyLongPress(data.code);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReaderManger
});
//# sourceMappingURL=reader.manager.js.map
