import Common "common";

module {
  public type AlertId = Common.AlertId;
  public type SensorId = Common.SensorId;
  public type Timestamp = Common.Timestamp;

  /// Why an alert was generated.
  public type AlertReason = {
    #belowMin;
    #aboveMax;
    #movementDetected;
  };

  /// An alert generated automatically from a sensor reading.
  public type Alert = {
    id : AlertId;
    sensorId : SensorId;
    reason : AlertReason;
    value : Float;
    message : Text;
    createdAt : Timestamp;
    read : Bool;
  };

  /// Shared view of an alert returned across the API boundary.
  public type AlertView = {
    id : AlertId;
    sensorId : SensorId;
    reason : AlertReason;
    value : Float;
    message : Text;
    createdAt : Timestamp;
    read : Bool;
  };
};
