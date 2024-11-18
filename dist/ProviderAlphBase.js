import { IInjectedProviderNames } from '@chargerwallet/cross-inpage-provider-types';
import { ProviderBase } from '@chargerwallet/cross-inpage-provider-core';
class ProviderAlphBase extends ProviderBase {
    constructor(props) {
        super(props);
        this.providerName = IInjectedProviderNames.alephium;
    }
    request(data) {
        return this.bridgeRequest(data);
    }
}
export { ProviderAlphBase };
