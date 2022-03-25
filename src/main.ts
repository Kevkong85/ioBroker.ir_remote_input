/*
 * Created with @iobroker/create-adapter v2.1.0
 */

import * as utils from '@iobroker/adapter-core';
import { ReaderManger } from './reader.manager';
import { StateStoreService } from './stateStore.service';

class IrRemoteInput extends utils.Adapter {

    private _stateStore: StateStoreService;
    private _readerManager: ReaderManger;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'ir_remote_input',
        });

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));

        this._stateStore = new StateStoreService(this);
        this._readerManager = new ReaderManger(this, this._stateStore);
    }

    private async onReady(): Promise<void> {
        await this._stateStore.init();
        this._readerManager.init(this.config.devicePath);
    }

    private onUnload(callback: () => void): void {
        try {
            this.log.info('unloading...');
            this._readerManager.destroy();
        } catch (e) {
            this.log.warn('error while unloading: ' + e);
        } finally {
            callback();
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new IrRemoteInput(options);
} else {
    // otherwise start the instance directly
    (() => new IrRemoteInput())();
}