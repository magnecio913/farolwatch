import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type FarolId = Nat;
  type PositionId = Nat;
  type SensorId = Nat;
  type AlertId = Nat;
  type DeviceId = Nat;
  type Timestamp = Int;

  type Farol = {
    id : FarolId;
    name : Text;
    qrCode : Text;
    latitude : Float;
    longitude : Float;
    registeredAt : Timestamp;
  };

  type PositionEntry = {
    id : PositionId;
    farolId : FarolId;
    latitude : Float;
    longitude : Float;
    recordedAt : Timestamp;
  };

  type SensorType = { #movement; #humidity; #temperature; #battery };
  type SensorStatus = { #normal; #outOfRange };

  type Sensor = {
    id : SensorId;
    name : Text;
    qrCode : Text;
    sensorType : SensorType;
    farolId : ?FarolId;
    unit : Text;
    minValue : Float;
    maxValue : Float;
    lastValue : ?Float;
    lastReadingAt : ?Timestamp;
    status : SensorStatus;
  };

  type AlertReason = { #belowMin; #aboveMax; #movementDetected };

  type Alert = {
    id : AlertId;
    sensorId : SensorId;
    reason : AlertReason;
    value : Float;
    message : Text;
    createdAt : Timestamp;
    read : Bool;
  };

  type LinkedDevice = {
    id : DeviceId;
    name : Text;
    linkedAt : Timestamp;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    faroles : Map.Map<FarolId, Farol>;
    positions : List.List<PositionEntry>;
    sensors : Map.Map<SensorId, Sensor>;
    alerts : List.List<Alert>;
    devices : Map.Map<DeviceId, LinkedDevice>;
    state : {
      var nextFarolId : Nat;
      var nextPositionId : Nat;
      var nextSensorId : Nat;
      var nextAlertId : Nat;
      var nextDeviceId : Nat;
    };
  };

  public func migration(_old : {}) : NewActor {
    {
      accessControlState = AccessControl.initState();
      faroles = Map.empty();
      positions = List.empty();
      sensors = Map.empty();
      alerts = List.empty();
      devices = Map.empty();
      state = {
        var nextFarolId = 0;
        var nextPositionId = 0;
        var nextSensorId = 0;
        var nextAlertId = 0;
        var nextDeviceId = 0;
      };
    };
  };
};
