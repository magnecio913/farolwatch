import Common "common";

module {
  public type SensorId = Common.SensorId;
  public type FarolId = Common.FarolId;
  public type Timestamp = Common.Timestamp;

  /// Supported sensor kinds.
  public type SensorType = {
    #movement;
    #humidity;
    #temperature;
    #battery;
  };

  /// Current status of a sensor relative to its configured range.
  public type SensorStatus = {
    #normal;
    #outOfRange;
  };

  /// A sensor attached to a farol, with its latest reading and range.
  public type Sensor = {
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

  /// Shared view of a sensor returned across the API boundary.
  public type SensorView = {
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
};
