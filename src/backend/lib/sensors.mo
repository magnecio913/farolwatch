import Map "mo:core/Map";
import Types "../types/sensors";

module {
  func toView(sensor : Types.Sensor) : Types.SensorView {
    {
      id = sensor.id;
      name = sensor.name;
      qrCode = sensor.qrCode;
      sensorType = sensor.sensorType;
      farolId = sensor.farolId;
      unit = sensor.unit;
      minValue = sensor.minValue;
      maxValue = sensor.maxValue;
      lastValue = sensor.lastValue;
      lastReadingAt = sensor.lastReadingAt;
      status = sensor.status;
    };
  };

  func sameType(a : Types.SensorType, b : Types.SensorType) : Bool {
    switch (a, b) {
      case (#movement, #movement) { true };
      case (#humidity, #humidity) { true };
      case (#temperature, #temperature) { true };
      case (#battery, #battery) { true };
      case _ { false };
    };
  };

  func sameStatus(a : Types.SensorStatus, b : Types.SensorStatus) : Bool {
    switch (a, b) {
      case (#normal, #normal) { true };
      case (#outOfRange, #outOfRange) { true };
      case _ { false };
    };
  };

  /// Add a sensor manually or from its own QR code.
  public func addSensor(
    sensors : Map.Map<Types.SensorId, Types.Sensor>,
    state : { var nextSensorId : Nat },
    name : Text,
    qrCode : Text,
    sensorType : Types.SensorType,
    farolId : ?Types.FarolId,
    unit : Text,
    minValue : Float,
    maxValue : Float,
  ) : Types.SensorView {
    let id = state.nextSensorId;
    state.nextSensorId := id + 1;
    let sensor : Types.Sensor = {
      id;
      name;
      qrCode;
      sensorType;
      farolId;
      unit;
      minValue;
      maxValue;
      lastValue = null;
      lastReadingAt = null;
      status = #normal;
    };
    sensors.add(id, sensor);
    toView(sensor);
  };

  /// List sensors, optionally filtered by type, status and a search term.
  public func listSensors(
    sensors : Map.Map<Types.SensorId, Types.Sensor>,
    sensorType : ?Types.SensorType,
    status : ?Types.SensorStatus,
    search : ?Text,
  ) : [Types.SensorView] {
    let term = switch (search) {
      case (?text) { ?text.toLower() };
      case null { null };
    };
    sensors.values().filter(func sensor {
      let typeOk = switch (sensorType) {
        case (?wanted) { sameType(sensor.sensorType, wanted) };
        case null { true };
      };
      let statusOk = switch (status) {
        case (?wanted) { sameStatus(sensor.status, wanted) };
        case null { true };
      };
      let searchOk = switch (term) {
        case (?text) {
          sensor.name.toLower().contains(#text text) or sensor.qrCode.toLower().contains(#text text);
        };
        case null { true };
      };
      typeOk and statusOk and searchOk;
    }).map(toView).toArray();
  };

  /// Fetch a single sensor by id.
  public func getSensor(sensors : Map.Map<Types.SensorId, Types.Sensor>, id : Types.SensorId) : ?Types.SensorView {
    switch (sensors.get(id)) {
      case (?sensor) { ?toView(sensor) };
      case null { null };
    };
  };

  /// Update the configured min/max range of a sensor.
  public func updateSensorRange(
    sensors : Map.Map<Types.SensorId, Types.Sensor>,
    id : Types.SensorId,
    minValue : Float,
    maxValue : Float,
  ) : ?Types.SensorView {
    switch (sensors.get(id)) {
      case (?sensor) {
        let updated : Types.Sensor = {
          id = sensor.id;
          name = sensor.name;
          qrCode = sensor.qrCode;
          sensorType = sensor.sensorType;
          farolId = sensor.farolId;
          unit = sensor.unit;
          minValue;
          maxValue;
          lastValue = sensor.lastValue;
          lastReadingAt = sensor.lastReadingAt;
          status = sensor.status;
        };
        sensors.add(id, updated);
        ?toView(updated);
      };
      case null { null };
    };
  };
};
