import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type AlertId = bigint;
export interface AlertView {
    id: AlertId;
    value: number;
    createdAt: Timestamp;
    read: boolean;
    sensorId: SensorId;
    message: string;
    reason: AlertReason;
}
export interface Cell {
    value: Value;
    name: string;
}
export type DeviceId = bigint;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type FarolId = bigint;
export interface FarolView {
    id: FarolId;
    latitude: number;
    name: string;
    longitude: number;
    registeredAt: Timestamp;
    qrCode: string;
}
export interface LinkedDeviceView {
    id: DeviceId;
    linkedAt: Timestamp;
    name: string;
}
export interface PositionEntryView {
    id: PositionId;
    latitude: number;
    farolId: FarolId;
    recordedAt: Timestamp;
    longitude: number;
}
export type PositionId = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type SensorId = bigint;
export interface SensorView {
    id: SensorId;
    status: SensorStatus;
    sensorType: SensorType;
    minValue: number;
    farolId?: FarolId;
    name: string;
    unit: string;
    lastValue?: number;
    maxValue: number;
    lastReadingAt?: Timestamp;
    qrCode: string;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum AlertReason {
    movementDetected = "movementDetected",
    aboveMax = "aboveMax",
    belowMin = "belowMin"
}
export enum SensorStatus {
    normal = "normal",
    outOfRange = "outOfRange"
}
export enum SensorType {
    movement = "movement",
    temperature = "temperature",
    humidity = "humidity",
    battery = "battery"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Add a sensor manually or from its own QR code.
     */
    addSensor(name: string, qrCode: string, sensorType: SensorType, farolId: FarolId | null, unit: string, minValue: number, maxValue: number): Promise<SensorView>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Fetch a single alert by id.
     */
    getAlert(id: AlertId): Promise<AlertView | null>;
    /**
     * / Static Markdown documentation of the public backend API.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Fetch a single farol by id.
     */
    getFarol(id: FarolId): Promise<FarolView | null>;
    /**
     * / Fetch a single sensor by id.
     */
    getSensor(id: SensorId): Promise<SensorView | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Link a mobile phone as a registered device.
     */
    linkDevice(name: string): Promise<LinkedDeviceView>;
    /**
     * / List alerts, newest first.
     */
    listAlerts(): Promise<Array<AlertView>>;
    /**
     * / List every linked device.
     */
    listDevices(): Promise<Array<LinkedDeviceView>>;
    /**
     * / List every registered farol.
     */
    listFaroles(): Promise<Array<FarolView>>;
    /**
     * / Position history for a farol, newest first.
     */
    listPositions(farolId: FarolId): Promise<Array<PositionEntryView>>;
    /**
     * / List sensors with optional type, status and search filters.
     */
    listSensors(sensorType: SensorType | null, status: SensorStatus | null, search: string | null): Promise<Array<SensorView>>;
    /**
     * / Mark an alert as read.
     */
    markAlertRead(id: AlertId): Promise<AlertView | null>;
    /**
     * / Record a sensor reading; alerts are derived automatically from the
     * / configured min/max range (or movement activity).
     */
    recordReading(sensorId: SensorId, value: number): Promise<Array<AlertView>>;
    /**
     * / Register a farol from a QR scan, capturing the device GPS position.
     */
    registerFarol(qrCode: string, name: string, latitude: number, longitude: number): Promise<FarolView>;
    schema(): Promise<string>;
    /**
     * / Unlink a device by id.
     */
    unlinkDevice(id: DeviceId): Promise<boolean>;
    /**
     * / Update the configured min/max range of a sensor.
     */
    updateSensorRange(id: SensorId, minValue: number, maxValue: number): Promise<SensorView | null>;
}
