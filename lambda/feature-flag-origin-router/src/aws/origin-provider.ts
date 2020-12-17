export interface IOriginProvider {
    determineOrigin(clientId : string): Promise<string>;
}
