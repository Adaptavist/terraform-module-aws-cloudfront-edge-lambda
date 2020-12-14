export interface IParameterStore {
    getParameterValue(path:String): Promise<string>;
}
