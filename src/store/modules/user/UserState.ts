export default interface UserState {
    token: string;
    current: object | null;
    currentFacility: object;
    instanceUrl: string;
    preference: any;
    packingSlipEnabled: boolean;
}