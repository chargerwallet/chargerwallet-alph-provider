import { IInjectedProviderNames } from '@chargerwallet/cross-inpage-provider-types';
import { ProviderBase, IInpageProviderConfig } from '@chargerwallet/cross-inpage-provider-core';
declare class ProviderAlphBase extends ProviderBase {
    constructor(props: IInpageProviderConfig);
    protected providerName: IInjectedProviderNames;
    request(data: unknown): Promise<unknown>;
}
export { ProviderAlphBase };
