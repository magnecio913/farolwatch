import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Types "../types/sensors";
import SensorsLib "../lib/sensors";

mixin (
  sensors : Map.Map<Types.SensorId, Types.Sensor>,
  state : { var nextSensorId : Nat },
) {
  func requireAuthSensors(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Debes iniciar sesión para realizar esta acción");
    };
  };

  /// Add a sensor manually or from its own QR code.
  public shared ({ caller }) func addSensor(
    name : Text,
    qrCode : Text,
    sensorType : Types.SensorType,
    farolId : ?Types.FarolId,
    unit : Text,
    minValue : Float,
    maxValue : Float,
  ) : async Types.SensorView {
    requireAuthSensors(caller);
    SensorsLib.addSensor(sensors, state, name, qrCode, sensorType, farolId, unit, minValue, maxValue);
  };

  /// List sensors with optional type, status and search filters.
  public query ({ caller }) func listSensors(
    sensorType : ?Types.SensorType,
    status : ?Types.SensorStatus,
    search : ?Text,
  ) : async [Types.SensorView] {
    requireAuthSensors(caller);
    SensorsLib.listSensors(sensors, sensorType, status, search);
  };

  /// Fetch a single sensor by id.
  public query ({ caller }) func getSensor(id : Types.SensorId) : async ?Types.SensorView {
    requireAuthSensors(caller);
    SensorsLib.getSensor(sensors, id);
  };

  /// Update the configured min/max range of a sensor.
  public shared ({ caller }) func updateSensorRange(
    id : Types.SensorId,
    minValue : Float,
    maxValue : Float,
  ) : async ?Types.SensorView {
    requireAuthSensors(caller);
    SensorsLib.updateSensorRange(sensors, id, minValue, maxValue);
  };
};
