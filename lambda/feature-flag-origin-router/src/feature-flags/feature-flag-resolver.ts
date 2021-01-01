export interface IFeatureFlagResolver {
    resolveFlag(clientId: string, flag:string): Promise<boolean>;
}
