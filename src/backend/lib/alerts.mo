import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/alerts";
import SensorTypes "../types/sensors";

module {
  func toView(alert : Types.Alert) : Types.AlertView {
    {
      id = alert.id;
      sensorId = alert.sensorId;
      reason = alert.reason;
      value = alert.value;
      message = alert.message;
      createdAt = alert.createdAt;
      read = alert.read;
    };
  };

  func isMovement(sensorType : SensorTypes.SensorType) : Bool {
    switch (sensorType) {
      case (#movement) { true };
      case _ { false };
    };
  };

  func unitSuffix(unit : Text) : Text {
    if (unit == "") { "" } else { " " # unit };
  };

  /// Record a sensor reading and automatically derive alerts from the
  /// configured min/max range (or movement activity).
  public func recordReading(
    sensors : Map.Map<SensorTypes.SensorId, SensorTypes.Sensor>,
    alerts : List.List<Types.Alert>,
    state : { var nextAlertId : Nat },
    sensorId : SensorTypes.SensorId,
    value : Float,
    now : Types.Timestamp,
  ) : [Types.AlertView] {
    switch (sensors.get(sensorId)) {
      case null { [] };
      case (?sensor) {
        let movement = isMovement(sensor.sensorType);
        let outOfRange = value < sensor.minValue or value > sensor.maxValue;
        let status : SensorTypes.SensorStatus = if (movement) {
          if (value > 0.0) { #outOfRange } else { #normal };
        } else {
          if (outOfRange) { #outOfRange } else { #normal };
        };
        let updated : SensorTypes.Sensor = {
          id = sensor.id;
          name = sensor.name;
          qrCode = sensor.qrCode;
          sensorType = sensor.sensorType;
          farolId = sensor.farolId;
          unit = sensor.unit;
          minValue = sensor.minValue;
          maxValue = sensor.maxValue;
          lastValue = ?value;
          lastReadingAt = ?now;
          status;
        };
        sensors.add(sensorId, updated);

        let created = List.empty<Types.Alert>();
        if (movement) {
          if (value > 0.0) {
            let id = state.nextAlertId;
            state.nextAlertId := id + 1;
            let alert : Types.Alert = {
              id;
              sensorId;
              reason = #movementDetected;
              value;
              message = "Movimiento inusual detectado en " # sensor.name;
              createdAt = now;
              read = false;
            };
            alerts.add(alert);
            created.add(alert);
          };
        } else {
          if (value < sensor.minValue) {
            let id = state.nextAlertId;
            state.nextAlertId := id + 1;
            let alert : Types.Alert = {
              id;
              sensorId;
              reason = #belowMin;
              value;
              message = sensor.name # ": valor por debajo del mínimo (" # value.toText() # unitSuffix(sensor.unit) # ", mínimo " # sensor.minValue.toText() # unitSuffix(sensor.unit) # ")";
              createdAt = now;
              read = false;
            };
            alerts.add(alert);
            created.add(alert);
          } else if (value > sensor.maxValue) {
            let id = state.nextAlertId;
            state.nextAlertId := id + 1;
            let alert : Types.Alert = {
              id;
              sensorId;
              reason = #aboveMax;
              value;
              message = sensor.name # ": valor por encima del máximo (" # value.toText() # unitSuffix(sensor.unit) # ", máximo " # sensor.maxValue.toText() # unitSuffix(sensor.unit) # ")";
              createdAt = now;
              read = false;
            };
            alerts.add(alert);
            created.add(alert);
          };
        };
        created.toArray().map(toView);
      };
    };
  };

  /// List alerts, newest first.
  public func listAlerts(alerts : List.List<Types.Alert>) : [Types.AlertView] {
    let sorted = alerts.toArray().sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(toView);
  };

  /// Fetch a single alert by id.
  public func getAlert(alerts : List.List<Types.Alert>, id : Types.AlertId) : ?Types.AlertView {
    switch (alerts.find(func alert = alert.id == id)) {
      case (?alert) { ?toView(alert) };
      case null { null };
    };
  };

  /// Mark an alert as read.
  public func markAlertRead(alerts : List.List<Types.Alert>, id : Types.AlertId) : ?Types.AlertView {
    var result : ?Types.AlertView = null;
    alerts.mapInPlace(
      func(alert) {
        if (alert.id == id) {
          let updated : Types.Alert = {
            id = alert.id;
            sensorId = alert.sensorId;
            reason = alert.reason;
            value = alert.value;
            message = alert.message;
            createdAt = alert.createdAt;
            read = true;
          };
          result := ?toView(updated);
          updated;
        } else {
          alert;
        };
      }
    );
    result;
  };
};
