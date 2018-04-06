import {ActionType} from '../@types';

class QueryAction {

    private _type: ActionType;
    private _payload: any;

    constructor(type: ActionType) {
        this._type = type;
    }

    get payload(): any {
        return this._payload;
    }

    set payload(value: any) {
        this._payload = value;
    }

    get type(): ActionType {
        return this._type;
    }

    set type(value: ActionType) {
        this._type = value;
    }
}

export default QueryAction;