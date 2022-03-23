var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stateStore_service_exports = {};
__export(stateStore_service_exports, {
  StateStoreService: () => StateStoreService
});
module.exports = __toCommonJS(stateStore_service_exports);
var import_rxjs = require("rxjs");
const STATE_KEYPRESS = "keyPress";
const STATE_KEYLONGPRESS = "keyLongPress";
class StateStoreService {
  constructor(_adapterInstance) {
    this._adapterInstance = _adapterInstance;
    this._writeBuffer$ = new import_rxjs.Subject();
    this._unsubscribe$ = new import_rxjs.Subject();
  }
  async init() {
    await this._adapterInstance.setObjectNotExistsAsync(STATE_KEYPRESS, {
      type: "state",
      common: {
        name: STATE_KEYPRESS,
        type: "string",
        role: "state",
        read: true,
        write: true
      },
      native: {}
    });
    await this._adapterInstance.setObjectNotExistsAsync(STATE_KEYLONGPRESS, {
      type: "state",
      common: {
        name: STATE_KEYLONGPRESS,
        type: "string",
        role: "state",
        read: true,
        write: true
      },
      native: {}
    });
    this._writeBuffer$.pipe((0, import_rxjs.concatMap)((value) => {
      return this._write(value.state, value.key);
    })).pipe((0, import_rxjs.concatMap)((value) => {
      return (0, import_rxjs.of)(value);
    })).subscribe((value) => this._adapterInstance.log.info("SUB CALLED " + JSON.stringify(value)));
  }
  setKeyPress(key) {
    this._writeBuffer$.next({ state: STATE_KEYPRESS, key });
  }
  setKeyLongPress(key) {
    this._writeBuffer$.next({ state: STATE_KEYLONGPRESS, key });
  }
  destroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
  async _write(state, key) {
    return new Promise((resolve, reject) => {
      this._adapterInstance.setStateChanged(state, { val: key, ack: true }, (err) => {
        this._adapterInstance.log.info("CALLBACK HAPPENED");
        err ? reject(null) : resolve({ state, key });
      });
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StateStoreService
});
//# sourceMappingURL=stateStore.service.js.map
