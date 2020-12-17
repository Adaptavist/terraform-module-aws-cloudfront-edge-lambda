
import {IParameterStore} from "./parameter-store";
import AWS from "aws-sdk";
import {GetParameterRequest} from "aws-sdk/clients/ssm";

const SSM_PATH_PARAM_REGION = "us-east-1"

export default class SsmParameterStore implements IParameterStore {

    static SSM: AWS.SSM;

    constructor() {
        if(!SsmParameterStore.SSM) {
            SsmParameterStore.SSM = new AWS.SSM({region: SSM_PATH_PARAM_REGION});
        }
    }

    public getParameterValue(path: string): Promise<string> {

        const params:GetParameterRequest = {
            Name: path,
            WithDecryption: true
        }

        return SsmParameterStore.SSM.getParameter(params).promise().then(result => {
            return result.Parameter!.Value!
        })
    }
}
