"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _ProviderAlph_nodeProvider, _ProviderAlph_explorerProvider;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderAlph = void 0;
const extension_bridge_injected_1 = require("@chargerwallet/extension-bridge-injected");
const web3_1 = require("@alephium/web3");
const ProviderAlphBase_1 = require("./ProviderAlphBase");
const PROVIDER_EVENTS = {
    'disconnect': 'disconnect',
    'accountChanged': 'accountChanged',
    'message_low_level': 'message_low_level',
};
function isWalletEventMethodMatch({ method, name }) {
    return method === `wallet_events_${name}`;
}
class ProviderAlph extends web3_1.InteractiveSignerProvider {
    constructor(props) {
        super();
        this.id = 'alephium';
        this.name = 'Alephium';
        this.icon = 'https://raw.githubusercontent.com/chargerwallet/chargerwallet-assets/refs/heads/main/chargerwallet.png';
        this.version = '0.9.4';
        this.onDisconnected = undefined;
        _ProviderAlph_nodeProvider.set(this, undefined);
        _ProviderAlph_explorerProvider.set(this, undefined);
        this._base = new ProviderAlphBase_1.ProviderAlphBase(Object.assign(Object.assign({}, props), { bridge: props.bridge || (0, extension_bridge_injected_1.getOrCreateExtInjectedJsBridge)({ timeout: props.timeout }) }));
        this._registerEvents();
    }
    bridgeRequest(data) {
        return this._base.request(data);
    }
    on(eventName, listener) {
        this._base.on(eventName, listener);
    }
    off(eventName, listener) {
        this._base.off(eventName, listener);
    }
    emit(eventName, ...args) {
        return this._base.emit(eventName, ...args);
    }
    _registerEvents() {
        window.addEventListener('chargerwallet_bridge_disconnect', () => {
            this._handleDisconnected();
        });
        this.on(PROVIDER_EVENTS.message_low_level, (payload) => {
            if (!payload)
                return;
            const { method, params } = payload;
            if (isWalletEventMethodMatch({ method, name: PROVIDER_EVENTS.accountChanged })) {
                this._handleAccountChange(params);
            }
        });
    }
    _handleConnected(accountInfo, options = { emit: true }) {
        var _a;
        this._accountInfo = accountInfo;
        if (options.emit && this._base.isConnectionStatusChanged('connected')) {
            this._base.connectionStatus = 'connected';
            const address = (_a = accountInfo.address) !== null && _a !== void 0 ? _a : null;
            this.emit('accountChanged', address);
        }
    }
    _handleDisconnected(options = { emit: true }) {
        this._accountInfo = undefined;
        if (options.emit && this._base.isConnectionStatusChanged('disconnected')) {
            this._base.connectionStatus = 'disconnected';
            this.emit('accountChanged', null);
        }
    }
    _isAccountsChanged(accountInfo) {
        var _a;
        return (accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.address) !== ((_a = this._accountInfo) === null || _a === void 0 ? void 0 : _a.address);
    }
    // trigger by bridge account change event
    _handleAccountChange(payload) {
        const accountInfo = payload;
        if (this._isAccountsChanged(accountInfo)) {
            this.emit('accountChanged', (accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.address) || null);
        }
        if (!accountInfo) {
            this._handleDisconnected();
            return;
        }
        this._handleConnected(accountInfo, { emit: false });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bridgeRequest({
                method: 'disconnect',
                params: [],
            });
            if (this.onDisconnected !== undefined) {
                yield this.onDisconnected();
            }
            this.onDisconnected = undefined;
            this._handleDisconnected();
        });
    }
    isPreauthorized(options) {
        return this.bridgeRequest({
            method: 'isPreauthorized',
            params: options,
        });
    }
    enableIfConnected(options) {
        if (options.onDisconnected) {
            this.onDisconnected = options.onDisconnected;
        }
        return this.bridgeRequest({
            method: 'enableIfConnected',
            params: options,
        });
    }
    get connectedAccount() {
        return this._accountInfo;
    }
    get connectedNetworkId() {
        return "mainnet";
    }
    unsafeEnable(opt) {
        let params = {};
        if (opt) {
            if (opt.onDisconnected) {
                this.onDisconnected = opt.onDisconnected;
            }
            params = {};
            Object.keys(opt).forEach((key) => {
                if (opt[key] instanceof Function) {
                    return;
                }
                params[key] = opt[key];
            });
        }
        return this.bridgeRequest({ method: 'unsafeEnable', params });
    }
    get nodeProvider() {
        if (!__classPrivateFieldGet(this, _ProviderAlph_nodeProvider, "f")) {
            __classPrivateFieldSet(this, _ProviderAlph_nodeProvider, new web3_1.NodeProvider('https://node.mainnet.alephium.org'), "f");
        }
        return __classPrivateFieldGet(this, _ProviderAlph_nodeProvider, "f");
    }
    get explorerProvider() {
        if (!__classPrivateFieldGet(this, _ProviderAlph_explorerProvider, "f")) {
            __classPrivateFieldSet(this, _ProviderAlph_explorerProvider, new web3_1.ExplorerProvider('https://backend.mainnet.alephium.org'), "f");
        }
        return __classPrivateFieldGet(this, _ProviderAlph_explorerProvider, "f");
    }
    unsafeGetSelectedAccount() {
        return this.bridgeRequest({ method: 'unsafeGetSelectedAccount' });
    }
    signAndSubmitDeployContractTx(params) {
        return this.bridgeRequest({ method: 'signAndSubmitDeployContractTx', params: JSON.stringify(params) });
    }
    signAndSubmitExecuteScriptTx(params) {
        return this.bridgeRequest({ method: 'signAndSubmitExecuteScriptTx', params: JSON.stringify(params) });
    }
    signAndSubmitTransferTx(params) {
        return this.bridgeRequest({ method: 'signAndSubmitTransferTx', params: JSON.stringify(params) });
    }
    signAndSubmitUnsignedTx(params) {
        return this.bridgeRequest({ method: 'signAndSubmitUnsignedTx', params: JSON.stringify(params) });
    }
    signUnsignedTx(params) {
        return this.bridgeRequest({ method: 'signUnsignedTx', params: JSON.stringify(params) });
    }
    signMessage(params) {
        return this.bridgeRequest({ method: 'signMessage', params: JSON.stringify(params) });
    }
    request(message) {
        return this.bridgeRequest({ method: 'addNewToken', params: message.params });
    }
}
exports.ProviderAlph = ProviderAlph;
_ProviderAlph_nodeProvider = new WeakMap(), _ProviderAlph_explorerProvider = new WeakMap();
