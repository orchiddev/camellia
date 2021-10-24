declare module "camellia.js" {
    // imports
    import { EventEmitter } from 'events';
    import { PathLike } from 'fs';
    import * as WebSocket from 'ws';

    export const version: string;

    //#region Classes



    //#endregion

    // Constants
    export const Constants: {
        Package: {
            name: string;
            version: string;
            description: string;
            main: PathLike;
            types: PathLike;

            scripts: { [key: string]: string };

            repository: { type: string; url: string };
            keywords: string[];
            author: string;
            license: string;
            bugs: { url: string };
            homepage: string;

            dependencies: { [key: string]: string };
            peerDependencies: { [key: string]: string };
            devDependencies: { [key: string]: string };

            [key: string]: any;
        };
    }

    //#region Collections

    export class Collection<K, V> extends Map<K, V> {
        public add<T>(
            fn: (value: V) => Collection<K, T>
        ): T

        public find<T>(
            fn: (value: V, key: K) => Collection<K, T>
        ): T | null

        public filter<T>(
            fn: (value: V, key: K) => Collection<K, T>
        ): T[] | []

        public remove<T> (
            item: T | number
        ): T | null

        public toJSON(): object;
    }

    //#endregion

    //#region Typedefs

    interface ClientOptions {
        _tokenHeader?: string | "Bot";
        disableEveryone?: boolean | true;

        // options
        ws?: WebSocketOptions;
        http?: HTTPOptions;
    }

    //#endregion
}