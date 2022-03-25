import { AdapterInstance } from '@iobroker/adapter-core';
import EvdevReader, { Evdev } from 'evdev';
import { filter, finalize, first, map, race, Subject, switchMap, takeUntil, takeWhile } from 'rxjs';
import { IStore } from './stateStore.service';

export class ReaderManger {
    private _reader: EvdevReader;
    private _keyEvent$ = new Subject<Evdev.Event>();
    private _unsubscribe$ = new Subject<void>();

    constructor(
        private _adapterInstance: AdapterInstance,
        private _store: IStore
    ) {
        this._reader = new EvdevReader({ raw: false });

        this._keyEvent$.pipe(
            filter(data => data.value === 1),
            switchMap(startEvent => race([
                this._keyEvent$.pipe(filter(data => data.value === 0), map(_ => startEvent), first()),
                this._keyEvent$.pipe(takeWhile(data => data.value === 2))
            ]).pipe(finalize(() => { this._clearKeyEvents(); }))),
            takeUntil(this._unsubscribe$),
            finalize(() => this._clearKeyEvents())
        ).subscribe(data => { this._setKeyEvent(data); });
    }

    public init(devicePath: string): void {

        this._reader.on('EV_KEY', data => this._keyEvent$.next(data));

        this._reader.on('error', err => {
            this._adapterInstance.log.error('reader error : ' + err);
        });

        this._reader.search('/dev/input/by-path', devicePath, (err, devicePaths) => {
            if(err || !devicePaths.length) {
                this._adapterInstance.log.warn('No input device found for given config, run ls /dev/input/by-path/ to identify your device');
                return;
            }

            this._adapterInstance.log.info('Devices found: ' + JSON.stringify(devicePaths));
            if(devicePaths.length > 1) {
                this._adapterInstance.log.warn('More than one possible input device found, please configure a more precise path');
            }

            const device = this._reader.open(devicePaths[0]);
            device.on('open', () => {
                this._adapterInstance.log.info('Device successfully opened');
            });
        });
    }

    public destroy(): void {
        this._reader.close();
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }

    private _clearKeyEvents(): void {
        this._store.setKeyPress('');
        this._store.setKeyLongPress('');
    }

    private _setKeyEvent(data: Evdev.Event): void {
        if(data.value === 1) {
            this._store.setKeyPress(data.code);
        }

        if(data.value === 2) {
            this._store.setKeyLongPress(data.code);
        }
    }
}