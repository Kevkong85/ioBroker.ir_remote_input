import { AdapterInstance } from '@iobroker/adapter-core';
import { concatMap, of, Subject, takeUntil } from 'rxjs';

const STATE_KEYPRESS = 'keyPress';
const STATE_KEYLONGPRESS = 'keyLongPress';

export interface IStore {
    setKeyPress(key: string): void;
    setKeyLongPress(key: string): void;
}

export class StateStoreService implements IStore {

    private _writeBuffer$ = new Subject<{ state: string, key: string }>();
    private _unsubscribe$ = new Subject<void>();

    constructor(private _adapterInstance: AdapterInstance ) {}

    public async init(): Promise<void> {
        await this._adapterInstance.setObjectNotExistsAsync(STATE_KEYPRESS, {
            type: 'state',
            common: {
                name: STATE_KEYPRESS,
                type: 'string',
                role: 'state',
                read: true,
                write: true,
            },
            native: {},
        });

        await this._adapterInstance.setObjectNotExistsAsync(STATE_KEYLONGPRESS, {
            type: 'state',
            common: {
                name: STATE_KEYLONGPRESS,
                type: 'string',
                role: 'state',
                read: true,
                write: true,
            },
            native: {},
        });

        this._writeBuffer$.pipe(
            concatMap(value => {
                return this._write(value.state, value.key);
            })
        ).pipe(
            concatMap(value => {
                return of(value);
            }),
            takeUntil(this._unsubscribe$)
        ).subscribe(value => this._adapterInstance.log.info('SUB CALLED ' + JSON.stringify(value)));
    }

    public setKeyPress(key: string): void {
        this._writeBuffer$.next({state: STATE_KEYPRESS, key: key});
    }

    public setKeyLongPress(key: string): void {
        this._writeBuffer$.next({state: STATE_KEYLONGPRESS, key: key});
    }

    public destroy(): void {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }

    private async _write(state: string, key: string): Promise<{state: string, key: string}> {
        return new Promise((resolve, reject) => {
            this._adapterInstance.setStateChanged(state, { val: key, ack: true }, (err) => {
                this._adapterInstance.log.info('CALLBACK HAPPENED');
                err ? reject(null) : resolve({state: state, key: key});
            });
        });
    }
}